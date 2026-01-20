#!/usr/bin/env python3
"""
ZENGO - Full control daemon for Antelope ZenGo Synergy Core
Reads HID knob events, controls PipeWire volume
No abstraction, direct hardware access
"""
import os
import sys
import struct
import time
import subprocess
import threading
import select

# Hardware constants
HIDRAW = "/dev/hidraw5"
VENDOR_ID = 0x23e5
PRODUCT_ID = 0xa015

# PipeWire sink ID for ZenGo (get dynamically)
def get_zengo_sink():
    """Find ZenGo sink ID dynamically"""
    result = subprocess.run(
        ["wpctl", "status"],
        capture_output=True, text=True
    )
    for line in result.stdout.split('\n'):
        if 'ZenGoSC' in line and 'Sink' not in line:
            # Extract ID from line like "   43. ZenGoSC Multicanal"
            parts = line.strip().split('.')
            if len(parts) >= 1:
                id_part = parts[0].strip().replace('*', '').strip()
                if id_part.isdigit():
                    return id_part
    return "43"  # fallback

class ZenGoDaemon:
    def __init__(self):
        self.hid = None
        self.volume = 1.0
        self.running = False
        self.sink_id = get_zengo_sink()
        self.last_value = None

    def connect(self):
        """Connect to ZenGo HID"""
        try:
            self.hid = open(HIDRAW, "rb", buffering=0)
            # Set non-blocking
            import fcntl
            flags = fcntl.fcntl(self.hid.fileno(), fcntl.F_GETFL)
            fcntl.fcntl(self.hid.fileno(), fcntl.F_SETFL, flags | os.O_NONBLOCK)
            print(f"✓ Connected to {HIDRAW}")
            return True
        except PermissionError:
            print(f"✗ Permission denied: {HIDRAW}")
            print("  Run: sudo chmod 666 /dev/hidraw5")
            print("  Or add udev rule (see --setup)")
            return False
        except FileNotFoundError:
            print(f"✗ Device not found: {HIDRAW}")
            return False
        except Exception as e:
            print(f"✗ Error: {e}")
            return False

    def disconnect(self):
        if self.hid:
            self.hid.close()
            self.hid = None

    def get_volume(self):
        """Get current PipeWire volume"""
        result = subprocess.run(
            ["wpctl", "get-volume", self.sink_id],
            capture_output=True, text=True
        )
        # Parse "Volume: 1.00" or "Volume: 0.75 [MUTED]"
        if result.returncode == 0:
            parts = result.stdout.strip().split()
            if len(parts) >= 2:
                try:
                    return float(parts[1])
                except:
                    pass
        return 1.0

    def set_volume(self, vol):
        """Set PipeWire volume (0.0 - 1.5)"""
        vol = max(0.0, min(1.5, vol))
        subprocess.run(
            ["wpctl", "set-volume", self.sink_id, f"{vol:.2f}"],
            capture_output=True
        )
        self.volume = vol
        return vol

    def parse_hid_report(self, data):
        """
        Parse HID report from ZenGo knob
        Returns: delta (-1, 0, +1) or None

        Protocol discovery:
        - Report is typically 8-64 bytes
        - Knob sends relative movement (encoder style)
        - Need to sniff actual data to determine format
        """
        if not data or len(data) < 1:
            return None

        # Debug: print raw data
        # print(f"HID: {data.hex()}")

        # Common HID encoder patterns to try:

        # Pattern 1: Single byte relative (-1/+1)
        if len(data) >= 1:
            val = data[0]
            if val == 0x01 or val == 0xff:  # +1 or -1 (signed)
                return 1 if val == 0x01 else -1

        # Pattern 2: Report ID + relative value
        if len(data) >= 2:
            report_id = data[0]
            val = data[1]
            if val == 0x01:
                return 1
            elif val == 0xff:
                return -1

        # Pattern 3: Absolute value (0-255 or 0-127)
        if len(data) >= 2:
            val = data[1]
            if self.last_value is not None:
                delta = val - self.last_value
                if delta != 0:
                    self.last_value = val
                    return 1 if delta > 0 else -1
            self.last_value = val

        return None

    def run(self):
        """Main daemon loop - read HID, adjust volume"""
        if not self.connect():
            return False

        self.running = True
        self.volume = self.get_volume()
        print(f"✓ Daemon started (sink {self.sink_id}, vol {self.volume:.0%})")
        print("  Turn knob to test...")
        print("  Ctrl+C to stop")

        step = 0.02  # 2% per click

        try:
            while self.running:
                # Use select for non-blocking read with timeout
                readable, _, _ = select.select([self.hid], [], [], 0.1)

                if readable:
                    try:
                        data = self.hid.read(64)
                        if data:
                            delta = self.parse_hid_report(data)
                            if delta:
                                new_vol = self.volume + (delta * step)
                                new_vol = self.set_volume(new_vol)
                                print(f"  Volume: {new_vol:.0%}", end='\r')
                    except BlockingIOError:
                        pass
                    except Exception as e:
                        print(f"\n  Read error: {e}")

        except KeyboardInterrupt:
            print("\n✓ Stopped")
        finally:
            self.disconnect()

        return True

    def sniff(self, duration=10):
        """Sniff HID data to discover protocol"""
        if not self.connect():
            return

        print(f"Sniffing HID for {duration}s - turn the knob!")
        print("-" * 50)

        start = time.time()
        seen = set()

        try:
            while time.time() - start < duration:
                readable, _, _ = select.select([self.hid], [], [], 0.1)
                if readable:
                    try:
                        data = self.hid.read(64)
                        if data:
                            hex_data = data.hex()
                            if hex_data not in seen:
                                seen.add(hex_data)
                                print(f"  [{len(data):2d}] {hex_data}")
                    except:
                        pass
        except KeyboardInterrupt:
            pass
        finally:
            self.disconnect()

        print("-" * 50)
        print(f"Captured {len(seen)} unique reports")

    def status(self):
        """Get full status"""
        sink_id = get_zengo_sink()
        vol = self.get_volume()

        # Check HID access
        hid_ok = os.access(HIDRAW, os.R_OK)

        return {
            "device": "ZenGoSC",
            "vendor": f"{VENDOR_ID:04x}",
            "product": f"{PRODUCT_ID:04x}",
            "hidraw": HIDRAW,
            "hid_accessible": hid_ok,
            "pipewire_sink": sink_id,
            "volume": f"{vol:.0%}",
        }

    def send_display(self, data):
        """Send raw data to display via HID"""
        if not self.hid:
            if not self.connect():
                return False
        try:
            # HID write needs to be opened in write mode
            with open(HIDRAW, "wb", buffering=0) as hid_out:
                hid_out.write(bytes(data))
            return True
        except Exception as e:
            print(f"Display write error: {e}")
            return False

    def visualizer(self):
        """
        Audio visualizer on ZenGo display
        Reads PipeWire audio levels, sends to display
        """
        import numpy as np

        print("✓ Visualizer starting...")
        print("  Reading audio levels from PipeWire")
        print("  Ctrl+C to stop")

        # Display dimensions (guessed - need to discover)
        WIDTH = 128
        HEIGHT = 32

        self.running = True

        try:
            while self.running:
                # Get audio level via pw-cli or pactl
                result = subprocess.run(
                    ["pactl", "list", "sink-inputs"],
                    capture_output=True, text=True
                )

                # For now, simulate with random data
                # Real implementation would use pw-mon or JACK
                import random
                levels = [random.randint(0, HEIGHT) for _ in range(WIDTH // 4)]

                # Build display buffer
                # Format TBD - common: report_id + bitmap
                buffer = [0x00] * 64  # Report ID 0

                # Simple bar visualization
                for i, level in enumerate(levels[:16]):
                    buffer[i + 1] = min(255, level * 8)

                # Send to display
                self.send_display(buffer)

                time.sleep(0.033)  # ~30 FPS

        except KeyboardInterrupt:
            print("\n✓ Visualizer stopped")

    def probe_display(self):
        """
        Probe display by sending test patterns
        Helps discover the protocol
        """
        print("Probing ZenGo display...")
        print("Watch the display for changes!")
        print("-" * 50)

        patterns = [
            # Pattern 1: All zeros
            ("zeros", [0x00] * 64),
            # Pattern 2: All ones
            ("ones", [0xff] * 64),
            # Pattern 3: Report ID variants
            ("report_01", [0x01] + [0xaa] * 63),
            ("report_02", [0x02] + [0xaa] * 63),
            ("report_03", [0x03] + [0xaa] * 63),
            # Pattern 4: Incrementing
            ("increment", list(range(64))),
            # Pattern 5: Brightness/contrast candidates
            ("bright_cmd", [0x01, 0xff, 0x00] + [0x00] * 61),
            # Pattern 6: Common display init sequences
            ("init_ssd1306", [0x00, 0xae, 0xd5, 0x80, 0xa8, 0x1f] + [0x00] * 58),
        ]

        for name, data in patterns:
            print(f"  Testing: {name}...")
            self.send_display(data)
            time.sleep(1)
            input("  Press Enter for next pattern...")

        print("-" * 50)
        print("Did any pattern change the display?")


def setup():
    """Print setup instructions"""
    print("""
ZENGO SETUP
===========

1. Create udev rule for HID access:
   echo 'SUBSYSTEM=="hidraw", ATTRS{idVendor}=="23e5", ATTRS{idProduct}=="a015", MODE="0666"' | sudo tee /etc/udev/rules.d/99-zengo.rules
   sudo udevadm control --reload-rules
   sudo udevadm trigger

2. Or quick fix (temporary):
   sudo chmod 666 /dev/hidraw5

3. Run daemon:
   python zengo.py daemon

4. Or run as systemd service:
   python zengo.py install
""")


def install_service():
    """Install as systemd user service"""
    service = f"""[Unit]
Description=ZenGo HID Volume Daemon
After=pipewire.service

[Service]
Type=simple
ExecStart=/usr/bin/python3 {os.path.abspath(__file__)} daemon
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
"""

    service_path = os.path.expanduser("~/.config/systemd/user/zengo.service")
    os.makedirs(os.path.dirname(service_path), exist_ok=True)

    with open(service_path, 'w') as f:
        f.write(service)

    print(f"✓ Service written to {service_path}")
    print("  Enable with: systemctl --user enable --now zengo")


def main():
    import json

    if len(sys.argv) < 2:
        print("zengo - Antelope ZenGo Synergy Core control")
        print()
        print("Commands:")
        print("  status      Show device status")
        print("  daemon      Run HID→volume daemon")
        print("  sniff       Sniff HID data (protocol discovery)")
        print("  probe       Probe display protocol")
        print("  viz         Audio visualizer on display")
        print("  volume N    Set volume (0-150)")
        print("  setup       Show setup instructions")
        print("  install     Install systemd service")
        return

    cmd = sys.argv[1]
    zg = ZenGoDaemon()

    if cmd == "status":
        print(json.dumps(zg.status(), indent=2))

    elif cmd == "daemon":
        zg.run()

    elif cmd == "sniff":
        duration = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        zg.sniff(duration)

    elif cmd == "probe":
        zg.probe_display()

    elif cmd == "viz":
        zg.visualizer()

    elif cmd == "volume":
        if len(sys.argv) > 2:
            vol = float(sys.argv[2]) / 100.0
            vol = zg.set_volume(vol)
            print(f"✓ Volume: {vol:.0%}")
        else:
            vol = zg.get_volume()
            print(f"Volume: {vol:.0%}")

    elif cmd == "setup":
        setup()

    elif cmd == "install":
        install_service()

    else:
        print(f"Unknown command: {cmd}")
        print("Run without arguments for help")


if __name__ == "__main__":
    main()
