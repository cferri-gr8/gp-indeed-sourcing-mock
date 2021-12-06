// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const he = require("he");
const fs = require("fs");

const STORE = {
  ENGAGEMENTS: JSON.parse(fs.readFileSync("data/engagements.json")),
  JOB_SEEKERS: JSON.parse(fs.readFileSync("data/job-seekers.json")),
};

app.use(express.json());

var messages = [];
const log = (msg) => {
  msg.timestamp = Date.now();
  console.log(msg);
  messages.push(msg);
};

app.get("/logs", (request, response) => {
  response.send(
    `<!DOCTYPE html><pre>${he.encode(JSON.stringify(messages, null, 2))}</pre>`
  );
});

app.get("/api/v1/engagements", (request, response) => {
  log({
    request: {
      headers: request.headers,
      body: request.body,
    },
  });

  const { recruiterId, employerId } = request.query;
  let { offset = 0, limit = 100 } = request.query;
  offset = parseInt(offset);
  limit = parseInt(limit);
  if (limit > 100 || limit < 1) limit = 100;

  if (!recruiterId) {
    return response.status(400).json({
      code: 400,
      cause: "Missing recruiterId",
      message: "A recruiterId is required",
    });
  }

  if (!employerId) {
    return response.status(400).json({
      code: 400,
      cause: "Missing employerId",
      message: "An employerId is required",
    });
  }

  const records = STORE.ENGAGEMENTS.slice(offset, offset + limit);

  return response.json({
    pagination: {
      count: records.length,
      total: STORE.ENGAGEMENTS.length,
    },
    data: {
      engagements: records,
    },
  });
});

app.post("/api/v1/resumes/bulkGet", (req, response) => {
  log({
    request: {
      headers: req.headers,
      body: req.body,
    },
  });

  const { recruiterId, employerId, bulkRequests } = req.body;

  if (!recruiterId) {
    return response.status(400).json({
      code: 400,
      cause: "Missing recruiterId",
      message: "A recruiterId is required",
    });
  }

  if (!employerId) {
    return response.status(400).json({
      code: 400,
      cause: "Missing employerId",
      message: "An employerId is required",
    });
  }

  const bulkResponses = [];

  bulkRequests.forEach((bulkRequest) => {
    const { bulkItemId, request } = bulkRequest;
    const { jobSeekerId } = request;

    const jobSeeker = STORE.JOB_SEEKERS[jobSeekerId];

    if (!jobSeeker) return;

    bulkResponses.push({
      bulkItemId,
      reponse: {
        resume: jobSeeker,
        viewResumeUrls: {
          onIndeed: `https://indeed.example.com/${jobSeekerId}`,
        },
      },
    });
  });

  return response.json({ bulkResponses });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
