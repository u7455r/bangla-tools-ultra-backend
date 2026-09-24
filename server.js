const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;


// ============================================
// CORS
// ============================================

app.use((req, res, next) => {

  const origin = req.headers.origin;

  if (
    origin === "https://u7455r.github.io" ||
    origin === "http://localhost" ||
    origin === "http://127.0.0.1"
  ) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  res.setHeader(
    "Vary",
    "Origin"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();

});


// ============================================
// JSON BODY
// ============================================

app.use(express.json({
  limit: "1mb"
}));


// ============================================
// HOME
// ============================================

app.get("/", (req, res) => {

  res.json({
    status: "online",
    service: "Bangla Tools Ultra Voice Backend"
  });

});


// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", (req, res) => {

  res.json({
    status: "ok"
  });

});


// ============================================
// CARTESIA TTS
// ============================================

app.post("/api/tts", async (req, res) => {

  try {

    if (!CARTESIA_API_KEY) {

      return res.status(500).json({
        error: "CARTESIA_API_KEY is not configured on Render."
      });

    }


    const {
      text,
      voiceId,
      language = "bn",
      speed = 1
    } = req.body;


    if (!text || !text.trim()) {

      return res.status(400).json({
        error: "Text is required."
      });

    }


    if (!voiceId || !voiceId.trim()) {

      return res.status(400).json({
        error: "Voice ID is required."
      });

    }


    const response = await fetch(
      "https://api.cartesia.ai/tts/bytes",
      {
        method: "POST",

        headers: {

          "X-API-Key":
            CARTESIA_API_KEY,

          "Cartesia-Version":
            "2025-04-16",

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

          model_id: "sonic-3",

          transcript: text,

          voice: {
            mode: "id",
            id: voiceId
          },

          output_format: {

            container: "wav",

            encoding: "pcm_s16le",

            sample_rate: 44100

          },

          language: language,

          speed: speed

        })

      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "Cartesia Error:",
        response.status,
        errorText
      );

      return res.status(
        response.status
      ).json({

        error:
          "Cartesia request failed.",

        details:
          errorText

      });

    }


    const audioBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );


    res.setHeader(
      "Content-Type",
      "audio/wav"
    );

    res.setHeader(
      "Content-Disposition",
      'inline; filename="voice.wav"'
    );

    res.send(audioBuffer);


  } catch (error) {

    console.error(
      "Server Error:",
      error
    );

    res.status(500).json({

      error:
        "Voice generation server error."

    });

  }

});


// ============================================
// START SERVER
// ============================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Bangla Tools Ultra backend running on port ${PORT}`
    );

  }
);
