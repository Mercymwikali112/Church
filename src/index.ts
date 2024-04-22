// Import necessary libraries
import { v4 as uuidv4 } from "uuid";
import { Server, StableBTreeMap } from "azle";
import express from "express";

// Define the Member class to represent church members
class Member {
  id: string;
  name: string;
  contact: string;
  membershipStatus: string;
  createdAt: Date;

  constructor(name: string, contact: string, membershipStatus: string) {
    this.id = uuidv4();
    this.name = name;
    this.contact = contact;
    this.membershipStatus = membershipStatus;
    this.createdAt = new Date();
  }
}

// Define the Event class to represent church events
class Event {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  location: string;
  createdAt: Date;

  constructor(
    title: string,
    description: string,
    dateTime: Date,
    location: string
  ) {
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.dateTime = dateTime;
    this.location = location;
    this.createdAt = new Date();
  }
}

// Define the Donation class to represent donations
class Donation {
  id: string;
  donorId: string;
  amount: number;
  createdAt: Date;

  constructor(donorId: string, amount: number) {
    this.id = uuidv4();
    this.donorId = donorId;
    this.amount = amount;
    this.createdAt = new Date();
  }
}

class Contribution {
  id: string;
  memberId: string;
  type: string; // 'Tithe', 'Pledge', or other types like 'Offering'
  amount: number;
  description: string;
  commitmentDate: Date; // Relevant for pledges
  fulfillmentDate: Date | null; // Track when a pledge is fulfilled
  createdAt: Date;

  constructor(
    memberId: string,
    type: string,
    amount: number,
    description: string,
    commitmentDate?: Date
  ) {
    this.id = uuidv4();
    this.memberId = memberId;
    this.type = type;
    this.amount = amount;
    this.description = description;
    this.commitmentDate = commitmentDate || new Date(); // Use the current date as default for commitment
    this.fulfillmentDate = null;
    this.createdAt = new Date();
  }
}

// Define the PrayerRequest class to represent prayer requests
class PrayerRequest {
  id: string;
  memberId: string;
  request: string;
  createdAt: Date;

  constructor(memberId: string, request: string) {
    this.id = uuidv4();
    this.memberId = memberId;
    this.request = request;
    this.createdAt = new Date();
  }
}

// Define the Content class to represent church content
class Content {
  id: string;
  type: string; // e.g., 'Sermon', 'Newsletter'
  title: string;
  content: string;
  createdAt: Date;

  constructor(type: string, title: string, content: string) {
    this.id = uuidv4();
    this.type = type;
    this.title = title;
    this.content = content;
    this.createdAt = new Date();
  }
}

// Initialize stable maps for storing church data
const membersStorage = StableBTreeMap<string, Member>(0);
const eventsStorage = StableBTreeMap<string, Event>(1);
const donationsStorage = StableBTreeMap<string, Donation>(2);
const prayerRequestsStorage = StableBTreeMap<string, PrayerRequest>(3);
const contentStorage = StableBTreeMap<string, Content>(4);
const contributionsStorage = StableBTreeMap<string, Contribution>(5);

// Define the express server
export default Server(() => {
  const app = express();
  app.use(express.json());

  // Endpoint for creating a new member
  app.post("/members", (req, res) => {
    // Validate input data for all fields at once
    if (
      !req.body.name ||
      typeof req.body.name !== "string" ||
      !req.body.contact ||
      typeof req.body.contact !== "string" ||
      !req.body.membershipStatus ||
      typeof req.body.membershipStatus !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'name', 'contact', and 'membershipStatus' are provided and are strings.",
      });
      return;
    }

    // Attempt to create a new Member instance and insert it into the storage
    try {
      const member = new Member(
        req.body.name,
        req.body.contact,
        req.body.membershipStatus
      );
      membersStorage.insert(member.id, member);
      // Send success message with created member data
      res.status(201).json({
        message: "Member created successfully",
        member: member,
      });
    } catch (error) {
      // Log error and respond with server error message
      console.error("Failed to create member:", error);
      res.status(500).json({
        error: "Server error occurred while creating the member.",
      });
    }
  });

  // Endpoint for retrieving all members
  app.get("/members", (req, res) => {
    try {
      // Attempt to retrieve all member data from storage
      const members = membersStorage.values();
      // Respond with success message and member data
      res.status(200).json({
        message: "Members retrieved successfully",
        members: members,
      });
    } catch (error) {
      // Log error and respond with server error message if retrieval fails
      console.error("Failed to retrieve members:", error);
      res.status(500).json({
        error: "Server error occurred while retrieving members.",
      });
    }
  });

  // Endpoint for creating a new event
  app.post("/events", (req, res) => {
    // Validate input data for all fields at once
    if (
      !req.body.title ||
      typeof req.body.title !== "string" ||
      !req.body.description ||
      typeof req.body.description !== "string" ||
      !req.body.dateTime ||
      !req.body.location ||
      typeof req.body.location !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'title', 'description', 'dateTime', and 'location' are provided and are of the correct types.",
      });
      return;
    }

    // Attempt to create a new Event instance and insert it into the storage
    try {
      const event = new Event(
        req.body.title,
        req.body.description,
        new Date(req.body.dateTime),
        req.body.location
      );
      eventsStorage.insert(event.id, event);
      // Send success message with created event data
      res.status(201).json({
        message: "Event created successfully",
        event: event,
      });
    } catch (error) {
      // Log error and respond with server error message
      console.error("Failed to create event:", error);
      res.status(500).json({
        error: "Server error occurred while creating the event.",
      });
    }
  });

  // Endpoint for retrieving a specific member
  app.get("/members/:id", (req, res) => {
    const member = membersStorage.get(req.params.id);
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    res.status(200).json(member);
  });

  // Endpoint for updating a specific member
  app.put("/members/:id", (req, res) => {
    const memberId = req.params.id;
    const member = membersStorage.get(memberId);
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    const { name, contact, membershipStatus } = req.body;
    if (!name || !contact || !membershipStatus) {
      res.status(400).json({ error: "Incomplete member data" });
      return;
    }
    member.name = name;
    member.contact = contact;
    member.membershipStatus = membershipStatus;
    membersStorage.insert(memberId, member);
    res.status(200).json({ message: "Member updated successfully", member });
  });


  // Endpoint for deleting a specific member
  app.delete("/members/:id", (req, res) => {
    const member = membersStorage.get(req.params.id);
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    membersStorage.remove(req.params.id);
    res.status(200).json({ message: "Member deleted successfully" });
  });


  // Endpoint for retrieving all events
  app.get("/events", (req, res) => {
    try {
      // Attempt to retrieve all event data from storage
      const events = eventsStorage.values();
      // Respond with success message and event data
      res.status(200).json({
        message: "Events retrieved successfully",
        events: events,
      });
    } catch (error) {
      // Log error and respond with server error message if retrieval fails
      console.error("Failed to retrieve events:", error);
      res.status(500).json({
        error: "Server error occurred while retrieving events.",
      });
    }
  });

  // Endpoint for creating a new donation
  app.post("/donations", (req, res) => {
    // Validate input data for all fields at once
    if (
      !req.body.donorId ||
      typeof req.body.donorId !== "string" ||
      !req.body.amount ||
      typeof req.body.amount !== "number"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'donorId' is provided as a string and 'amount' is provided as a number.",
      });
      return;
    }

    // Attempt to create a new Donation instance and insert it into the storage
    try {
      const donation = new Donation(req.body.donorId, req.body.amount);
      donationsStorage.insert(donation.id, donation);
      // Send success message with created donation data
      res.status(201).json({
        message: "Donation created successfully",
        donation: donation,
      });
    } catch (error) {
      // Log error and respond with server error message
      console.error("Failed to create donation:", error);
      res.status(500).json({
        error: "Server error occurred while creating the donation.",
      });
    }
  });

  // Endpoint for retrieving all donations
  app.get("/donations", (req, res) => {
    try {
      // Attempt to retrieve all donation data from storage
      const donations = donationsStorage.values();
      // Respond with success message and donation data
      res.status(200).json({
        message: "Donations retrieved successfully",
        donations: donations,
      });
    } catch (error) {
      // Log error and respond with server error message if retrieval fails
      console.error("Failed to retrieve donations:", error);
      res.status(500).json({
        error: "Server error occurred while retrieving donations.",
      });
    }
  });

  // Endpoint for creating a new contribution
  app.post("/contributions", (req, res) => {
    // Validate input data for all fields at once
    if (
      !req.body.memberId ||
      typeof req.body.memberId !== "string" ||
      !req.body.type ||
      typeof req.body.type !== "string" ||
      !req.body.amount ||
      typeof req.body.amount !== "number" ||
      !req.body.description ||
      typeof req.body.description !== "string" ||
      (req.body.type === "Pledge" && !req.body.commitmentDate)
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'memberId', 'type', 'amount', 'description', and if a pledge, 'commitmentDate' are provided and are of the correct types.",
      });
      return;
    }

    // Check if the memberId corresponds to a valid member in the membersStorage
    const member = membersStorage.get(req.body.memberId);
    if (member === undefined) {
      res.status(404).json({
        error:
          "Member not found: The provided memberId does not correspond to any registered member.",
      });
      return;
    }

    try {
      const contribution = new Contribution(
        req.body.memberId,
        req.body.type,
        req.body.amount,
        req.body.description,
        req.body.type === "Pledge"
          ? new Date(req.body.commitmentDate)
          : undefined
      );
      contributionsStorage.insert(contribution.id, contribution);
      res.status(201).json({
        message: "Contribution created successfully",
        contribution: contribution,
      });
    } catch (error) {
      console.error("Failed to create contribution:", error);
      res.status(500).json({
        error: "Server error occurred while creating the contribution.",
      });
    }
  });

  // Endpoint for retrieving all contributions
  app.get("/contributions", (req, res) => {
    try {
      const contributions = contributionsStorage.values();
      res.status(200).json({
        message: "Contributions retrieved successfully",
        contributions: contributions,
      });
    } catch (error) {
      console.error("Failed to retrieve contributions:", error);
      res.status(500).json({
        error: "Server error occurred while retrieving contributions.",
      });
    }
  });

  // Endpoint for creating a new prayer request
  app.post("/prayer-requests", (req, res) => {
    // Validate input data for all fields at once
    if (
      !req.body.memberId ||
      typeof req.body.memberId !== "string" ||
      !req.body.request ||
      typeof req.body.request !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'memberId' and 'request' are provided and are of the correct types.",
      });
      return;
    }

    // Attempt to create a new PrayerRequest instance and insert it into the storage
    try {
      const prayerRequest = new PrayerRequest(
        req.body.memberId,
        req.body.request
      );
      prayerRequestsStorage.insert(prayerRequest.id, prayerRequest);
      // Send success message with created prayer request data
      res.status(201).json({
        message: "Prayer request created successfully",
        prayerRequest: prayerRequest,
      });
    } catch (error) {
      // Log error and respond with server error message
      console.error("Failed to create prayer request:", error);
      res.status(500).json({
        error: "Server error occurred while creating the prayer request.",
      });
    }
  });

  // Endpoint for retrieving all prayer requests
  app.get("/prayer-requests", (req, res) => {
    try {
      // Attempt to retrieve all prayer request data from storage
      const prayerRequests = prayerRequestsStorage.values();
      // Respond with success message and prayer request data
      res.status(200).json({
        message: "Prayer requests retrieved successfully",
        prayerRequests: prayerRequests,
      });
    } catch (error) {
      // Log error and respond with server error message if retrieval fails
      console.error("Failed to retrieve prayer requests:", error);
      res.status(500).json({
        error: "Server error occurred while retrieving prayer requests.",
      });
    }
  });

  // Endpoint for creating new content
  app.post("/contents", (req, res) => {
    // Validate input data for all fields at once
    if (
      !req.body.type ||
      typeof req.body.type !== "string" ||
      !req.body.title ||
      typeof req.body.title !== "string" ||
      !req.body.content ||
      typeof req.body.content !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'type', 'title', and 'content' are provided and are strings.",
      });
      return;
    }

    // Attempt to create a new Content instance and insert it into the storage
    try {
      const content = new Content(
        req.body.type,
        req.body.title,
        req.body.content
      );
      contentStorage.insert(content.id, content);
      // Send success message with created content data
      res.status(201).json({
        message: "Content created successfully",
        content: content,
      });
    } catch (error) {
      // Log error and respond with server error message
      console.error("Failed to create content:", error);
      res.status(500).json({
        error: "Server error occurred while creating the content.",
      });
    }
  });

  // Endpoint for retrieving all content
  app.get("/contents", (req, res) => {
    try {
      // Attempt to retrieve all content data from storage
      const content = contentStorage.values();
      // Respond with success message and content data
      res.status(200).json({
        message: "Content retrieved successfully",
        content: content,
      });
    } catch (error) {
      // Log error and respond with server error message if retrieval fails
      console.error("Failed to retrieve content:", error);
      res.status(500).json({
        error: "Server error occurred while retrieving content.",
      });
    }
  });

  // Start the server
  return app.listen();
});
