const fs = require("fs");
const faker = require("faker");

const NUM_JOB_SEEKERS = 20;

const DEGREES = ["Bachelors Degree", "Masters Degree", "Associates Degree"];
const MAJORS = [
  "English",
  "Engineering",
  "Pediatric Nursing",
  "Science",
  "Business Administration",
  "Sales",
  "Graphic Design",
  "Computer Science",
  "European Marketing Management",
  "Law",
  "Nursing",
  "Mathematics",
  "Music",
  "Biology",
  "Accounting",
];

const UNIVERSITIES = [
  "American University",
  "Arcadia University",
  "Arizona State University",
  "Baylor University",
  "Bloomsburg University",
  "Boston College",
  "Brown University",
  "Canton High School",
  "Cardinal Stritch University",
  "Columbia",
  "Cornell University",
  "Drexel University",
  "Fordham",
  "Georgetown University",
  "Harvard University",
  "James Madison",
  "Massachusetts Institute of Technology",
  "Michigan State University",
  "New York University",
  "Northwestern University",
  "Ohio State University",
  "Pennsylvania State University",
  "Rutgers University",
  "Stanford University",
  "UCLA",
  "University of Pennsylvania",
];

const recruiterId = "mock-indeed-recruiter-id";
const employerId = "mock-indeed-employer-id";

const formatDate = (date) => {
  return date.toISOString().slice(0, 7);
};

const generateEngagements = (jobSeekers) => {
  const engagements = [];
  const STATUSES = ["SENT", "DECLINED"];

  for (const jobSeekerId in jobSeekers) {
    const jobSeeker = jobSeekers[jobSeekerId];
    const status = !jobSeeker.isRedacted
      ? "INTERESTED"
      : STATUSES[Math.floor(Math.random() * STATUSES.length)];

    const engagement = {
      engagementId: faker.datatype.uuid(),
      recruiterId,
      employerId,
      jobSeekerId,
      createdTimestamp: faker.date.recent(),
      status,
    };

    engagements.push(engagement);
  }

  return engagements;
};

const generateJobSeekers = (numRecords) => {
  const records = {};

  for (let index = 0; index < numRecords; index++) {
    const record = generateJobSeeker();
    records[record.jobSeekerId] = record;
  }

  return records;
};

const generateJobSeeker = () => {
  const isRedacted = faker.datatype.boolean();

  const contactInformation = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.phoneNumber(),
  };

  const jobSeeker = {
    jobSeekerId: faker.datatype.uuid(),
    isRedacted,
    headline: faker.name.jobTitle(),
    location: generateLocation(),
    summary: faker.lorem.paragraph(),
    additionalInformation: faker.lorem.paragraph(),
    workExperience: generateWorkExperience(Math.ceil(Math.random() * 5)),
    education: generateEducation(Math.ceil(Math.random() * 2)),
    skills: generateSkills(Math.ceil(Math.random() * 10)),
    militaryService: [],
    awards: [],
    certifications: [],
    licenses: [],
    assessments: [],
    groups: [],
    patents: [],
    publications: [],
  };

  if (isRedacted) {
    return jobSeeker;
  }

  return { ...jobSeeker, ...contactInformation };
};

const generateLocation = () => {
  return {
    city: faker.address.city(),
    country: faker.address.countryCode(),
  };
};

const generateWorkExperience = (numRecords) => {
  const records = [];

  for (let index = 0; index < numRecords; index++) {
    const startDate = faker.date.past(20);
    const endDate = faker.date.between(startDate, new Date());

    records.push({
      title: faker.name.jobTitle(),
      company: faker.company.companyName(),
      location: generateLocation(),
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      description: faker.lorem.paragraph(),
    });
  }

  return records;
};

const generateEducation = (numRecords) => {
  const records = [];

  for (let index = 0; index < numRecords; index++) {
    const startDate = faker.date.past(20);
    const endDate = faker.date.between(startDate, new Date());

    const degree = DEGREES[Math.floor(Math.random() * DEGREES.length)];
    const field = MAJORS[Math.floor(Math.random() * MAJORS.length)];
    const university =
      UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];

    records.push({
      degree,
      field,
      university,
      location: generateLocation(),
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
  }

  return records;
};

const generateSkills = (numRecords) => {
  const records = [];

  for (let index = 0; index < numRecords; index++) {
    records.push({
      skill: faker.lorem.sentence(),
      monthsOfExperience: Math.floor(Math.random() * 20),
    });
  }

  return records;
};

const existingEngagements = JSON.parse(
  fs.readFileSync("data/engagements.json")
);
const existingJobSeekers = JSON.parse(fs.readFileSync("data/job-seekers.json"));

const jobSeekers = generateJobSeekers(NUM_JOB_SEEKERS);
const engagements = generateEngagements(jobSeekers);

const engagementsStream = fs.createWriteStream("data/engagements.json", {
  flags: "w",
});

engagementsStream.write(
  JSON.stringify([...engagements, ...existingEngagements]) + "\n"
);

engagementsStream.end(); // close stream

const jobSeekersStream = fs.createWriteStream("data/job-seekers.json", {
  flags: "w",
});

jobSeekersStream.write(
  JSON.stringify({ ...existingJobSeekers, ...jobSeekers }) + "\n"
);

jobSeekersStream.end(); // close stream
