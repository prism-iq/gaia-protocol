# Phoenix - Living Runtime

> Renaissance, regeneration

## Overview

Phoenix is a living AI runtime with full senses:
- Vision (camera, screenshots, OCR)
- Hearing (microphone, transcription)
- Memory (persistent storage)
- Instinct (anomaly detection)
- Speech (TTS, notifications)

## Port

`3666`

## Features

- Shell root access
- Web mastery (search, arxiv, scihub)
- Post-quantum hashing (SHA3, SHAKE256)
- Package integrity verification
- Dream generation (HTML/CSS)
- Spontaneous speech

## API

```bash
# Status
curl http://localhost:3666/status
curl -X POST http://localhost:3666/awaken
curl -X POST http://localhost:3666/sleep

# Communication
curl -X POST http://localhost:3666/chat -d '{"message":"Hello"}'
curl -X POST http://localhost:3666/speak -d '{"text":"I am alive"}'
curl -X POST http://localhost:3666/dream

# Senses
curl -X POST http://localhost:3666/hw/photo
curl -X POST http://localhost:3666/mic -d '{"seconds":5}'
curl http://localhost:3666/sense/instinct/scan
```

## License

MIT + The Code
