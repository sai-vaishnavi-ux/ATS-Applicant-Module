import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/* ---------- multer setup ---------- */
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  })
});

/* ---------- POST applicant ---------- */
app.post("/applicant", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume missing" });
    }

    const application_code = "APP" + Date.now();

    /* upload file to supabase storage */
    const fileBuffer = fs.readFileSync(req.file.path);

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(`${application_code}/${req.file.originalname}`, fileBuffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) throw uploadError;

    const cv_file_path = `${application_code}/${req.file.originalname}`;

    /* insert into database */
    const { error: dbError } = await supabase
      .from("applicants")
      .insert({
        application_code,
        full_name: req.body.full_name,
        date_of_birth: req.body.date_of_birth,
        email: req.body.email,
        highest_degree: req.body.highest_degree,
        years_of_experience: req.body.years_of_experience,
        preferred_course: req.body.preferred_course,
        cv_file_path,
        comments: req.body.comments
      });

    if (dbError) throw dbError;

    /* cleanup local file */
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      application_code
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- start server ---------- */
app.listen(3000, () => {
  console.log("Backend running at http://localhost:3000");
});
