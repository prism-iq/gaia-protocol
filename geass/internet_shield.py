#!/usr/bin/env python3
"""
CODE GEASS - Internet Protection Training
Chaque personnage protège d'une menace spécifique
"""
import subprocess
import re
from pathlib import Path

HOSTS_FILE = "/etc/hosts"
IPTABLES = "/usr/sbin/iptables"

class GeassInternetShield:
    
    # ═══════════════════════════════════════════════════════════
    # LELOUCH - Firewall Commander
    # Ordre absolu: BLOQUE ces IPs/ports
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def lelouch_firewall(action="status"):
        """Commande le firewall avec autorité absolue"""
        if action == "lockdown":
            # Bloque tout sauf SSH, HTTP, HTTPS, DNS
            rules = [
                f"{IPTABLES} -F",
                f"{IPTABLES} -P INPUT DROP",
                f"{IPTABLES} -P FORWARD DROP", 
                f"{IPTABLES} -P OUTPUT ACCEPT",
                f"{IPTABLES} -A INPUT -i lo -j ACCEPT",
                f"{IPTABLES} -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT",
                f"{IPTABLES} -A INPUT -p tcp --dport 22 -j ACCEPT",
                f"{IPTABLES} -A INPUT -p tcp --dport 80 -j ACCEPT",
                f"{IPTABLES} -A INPUT -p tcp --dport 443 -j ACCEPT",
                f"{IPTABLES} -A INPUT -p udp --dport 53 -j ACCEPT",
            ]
            for r in rules:
                subprocess.run(r.split(), capture_output=True)
            return {"lelouch": "LOCKDOWN ACTIVE", "policy": "DROP all except essential"}
        
        elif action == "open":
            subprocess.run(f"{IPTABLES} -F".split(), capture_output=True)
            subprocess.run(f"{IPTABLES} -P INPUT ACCEPT".split(), capture_output=True)
            return {"lelouch": "Firewall opened"}
        
        else:
            result = subprocess.getoutput(f"{IPTABLES} -L -n --line-numbers")
            return {"lelouch": "status", "rules": result}

    # ═══════════════════════════════════════════════════════════
    # C.C. - Immortal Blocklist
    # Ne meurt jamais: domaines bloqués persistent
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def cc_block_domains(domains=None):
        """Bloque des domaines de façon permanente dans /etc/hosts"""
        if domains is None:
            # Domaines malveillants connus
            domains = [
                # Trackers
                "googleadservices.com", "doubleclick.net", "googlesyndication.com",
                "facebook.com", "connect.facebook.net", "pixel.facebook.com",
                # Malware C2 connus
                "malware.com", "badware.net",
                # Telemetry Microsoft
                "telemetry.microsoft.com", "vortex.data.microsoft.com",
                # Analytics
                "google-analytics.com", "analytics.google.com",
            ]
        
        with open(HOSTS_FILE, 'r') as f:
            current = f.read()
        
        added = []
        for domain in domains:
            if domain not in current:
                with open(HOSTS_FILE, 'a') as f:
                    f.write(f"127.0.0.1 {domain}\n")
                added.append(domain)
        
        return {"cc": "immortal_blocklist", "added": added, "eternal": True}

    # ═══════════════════════════════════════════════════════════
    # MAO - Intrusion Detection (lit les pensées du réseau)
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def mao_detect_intrusion():
        """Détecte les connexions suspectes"""
        suspicious = []
        
        # Check connexions établies
        conns = subprocess.getoutput("ss -tun state established")
        
        # Ports suspects
        bad_ports = [4444, 5555, 6666, 6667, 31337, 1337, 9001, 4445]
        for line in conns.split('\n'):
            for port in bad_ports:
                if f":{port}" in line:
                    suspicious.append({"port": port, "line": line, "threat": "BACKDOOR"})
        
        # Check processus écoutant
        listeners = subprocess.getoutput("ss -tlnp")
        for port in bad_ports:
            if f":{port}" in listeners:
                suspicious.append({"port": port, "threat": "LISTENER", "action": "investigate"})
        
        # Check connexions sortantes vers pays suspects
        foreign = subprocess.getoutput("ss -tun | grep -v '127.0.0.1' | grep -v '192.168'")
        
        return {
            "mao": "mind_reading",
            "suspicious_connections": suspicious,
            "foreign_connections": len(foreign.split('\n')) - 1,
            "warning": "Cannot turn off - always watching"
        }

    # ═══════════════════════════════════════════════════════════
    # ROLO - Connection Freezer
    # Arrête le temps: freeze les connexions suspectes
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def rolo_freeze_connection(ip=None):
        """Freeze une IP suspecte (drop ses paquets)"""
        if ip:
            subprocess.run(f"{IPTABLES} -A INPUT -s {ip} -j DROP".split(), capture_output=True)
            subprocess.run(f"{IPTABLES} -A OUTPUT -d {ip} -j DROP".split(), capture_output=True)
            return {"rolo": "time_stop", "ip": ip, "frozen": True}
        return {"error": "need ip to freeze"}

    # ═══════════════════════════════════════════════════════════
    # JEREMIAH - Connection Restorer
    # Annule les blocages si faux positif
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def jeremiah_restore(ip=None):
        """Restore une IP bloquée"""
        if ip:
            subprocess.run(f"{IPTABLES} -D INPUT -s {ip} -j DROP".split(), capture_output=True)
            subprocess.run(f"{IPTABLES} -D OUTPUT -d {ip} -j DROP".split(), capture_output=True)
            return {"jeremiah": "geass_cancelled", "ip": ip, "restored": True}
        else:
            # Restore all
            subprocess.run(f"{IPTABLES} -F".split(), capture_output=True)
            return {"jeremiah": "all_restored", "loyalty": "ORANGE"}

    # ═══════════════════════════════════════════════════════════
    # SUZAKU - Survival Mode Network
    # Coupe tout sauf l'essentiel pour survivre
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def suzaku_survival():
        """Mode survie: coupe le réseau sauf local"""
        rules = [
            f"{IPTABLES} -F",
            f"{IPTABLES} -A INPUT -i lo -j ACCEPT",
            f"{IPTABLES} -A INPUT -s 127.0.0.1 -j ACCEPT",
            f"{IPTABLES} -A INPUT -s 192.168.0.0/16 -j ACCEPT",
            f"{IPTABLES} -A OUTPUT -d 127.0.0.1 -j ACCEPT",
            f"{IPTABLES} -A OUTPUT -d 192.168.0.0/16 -j ACCEPT",
            f"{IPTABLES} -P INPUT DROP",
            f"{IPTABLES} -P OUTPUT DROP",
        ]
        for r in rules:
            subprocess.run(r.split(), capture_output=True)
        return {"suzaku": "LIVE_ON", "network": "LOCAL_ONLY", "internet": "CUT"}

    # ═══════════════════════════════════════════════════════════
    # KALLEN - Attack Response
    # Radiant Wave: riposte en bloquant l'attaquant
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def kallen_counter_attack(attacker_ip):
        """Contre-attaque: bloque et log l'attaquant"""
        if attacker_ip:
            # Block
            subprocess.run(f"{IPTABLES} -A INPUT -s {attacker_ip} -j DROP".split())
            # Log
            with open("/var/log/geass_attacks.log", "a") as f:
                from datetime import datetime
                f.write(f"{datetime.now()} KALLEN BLOCKED: {attacker_ip}\n")
            return {"kallen": "RADIANT_WAVE", "attacker": attacker_ip, "blocked": True}
        return {"error": "need attacker_ip"}

    # ═══════════════════════════════════════════════════════════
    # NUNNALLY - Peaceful Monitoring
    # Voit la vérité: monitoring sans violence
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def nunnally_monitor():
        """Monitoring pacifique du réseau"""
        return {
            "nunnally": "truth_sight",
            "interfaces": subprocess.getoutput("ip -br link"),
            "dns": subprocess.getoutput("cat /etc/resolv.conf | grep nameserver"),
            "gateway": subprocess.getoutput("ip route | grep default"),
            "wish": "peaceful_internet"
        }

    # ═══════════════════════════════════════════════════════════
    # FULL SHIELD - Active tous les pouvoirs
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    def activate_full_shield():
        """Active la protection complète"""
        results = {}
        
        # C.C. - Blocklist immortelle
        results["cc"] = GeassInternetShield.cc_block_domains()
        
        # Lelouch - Firewall lockdown
        results["lelouch"] = GeassInternetShield.lelouch_firewall("lockdown")
        
        # Mao - Détection
        results["mao"] = GeassInternetShield.mao_detect_intrusion()
        
        # Nunnally - Status
        results["nunnally"] = GeassInternetShield.nunnally_monitor()
        
        return {
            "code_geass": "FULL_SHIELD_ACTIVE",
            "charles": "BLOCKED (America)",
            "protection_level": "MAXIMUM",
            "results": results
        }


if __name__ == "__main__":
    import sys
    shield = GeassInternetShield()
    
    if len(sys.argv) < 2:
        print("Usage: internet_shield.py [full|lelouch|mao|suzaku|status]")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "full":
        import json
        print(json.dumps(shield.activate_full_shield(), indent=2))
    elif cmd == "lelouch":
        action = sys.argv[2] if len(sys.argv) > 2 else "status"
        print(shield.lelouch_firewall(action))
    elif cmd == "mao":
        print(shield.mao_detect_intrusion())
    elif cmd == "suzaku":
        print(shield.suzaku_survival())
    elif cmd == "status":
        print(shield.nunnally_monitor())
