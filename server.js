const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

const CARTESIA_API_KEY =
    process.env.CARTESIA_API_KEY;

app.use(express.json({
    limit: "2mb"
}));

app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "Bangla Tools Ultra Voice Backend"
    });
});

app.post("/api/tts", async (req, res) => {

    try {

        if (!CARTESIA_API_KEY) {
            return res.status(500).json({
                error: "CARTESIA_API_KEY is not configured"
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
                error: "Text is required"
            });
        }

        if (!voiceId) {
            return res.status(400).json({
                error: "Voice ID is required"
            });
        }

        if (text.length > 5000) {
            return res.status(400).json({
                error: "Maximum 5000 characters allowed"
            });
        }

        const response = await fetch(
            "https://api.cartesia.ai/tts/bytes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": CARTESIA_API_KEY,
                    "Cartesia-Version": "2025-04-16"
                },

                body: JSON.stringify({

                    model_id: "sonic-3",

                    transcript: text,

                    voice: {
                        mode: "id",
                        id: voiceId
                    },

                    language: language,

                    output_format: {
                        container: "wav",
                        encoding: "pcm_s16le",
                        sample_rate: 44100
                    },

                    speed: speed
                })
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Cartesia error:",
                errorText
            );

            return res.status(response.status).json({
                error: "Cartesia request failed"
            });
        }

        const audio =
            Buffer.from(
                await response.arrayBuffer()
            );

        res.setHeader(
            "Content-Type",
            "audio/wav"
        );

        res.send(audio);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Voice generation failed"
        });
    }

});

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Bangla Tools Ultra backend running on port ${PORT}`
    );

});
