import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  saveFootprintEntry,
  getUserFootprints,
  getLatestFootprint,
} from "./firestore";

// Mock the firestore operations
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),
    doc: vi.fn((db, col, id) => ({ db, col, id, type: "doc_ref" })),
    collection: vi.fn((db, ...paths) => ({ db, paths, type: "col_ref" })),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    addDoc: (...args: any[]) => mockAddDoc(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    query: vi.fn((col, ...rules) => ({ col, rules, type: "query_ref" })),
    orderBy: vi.fn((field, dir) => ({ field, dir, type: "orderBy" })),
    limit: vi.fn((num) => ({ num, type: "limit" })),
    serverTimestamp: vi.fn(() => "mock_timestamp"),
    Timestamp: {
      now: vi.fn(() => ({ toMillis: () => Date.now() })),
    },
  };
});

vi.mock("./firebase", () => ({
  db: { type: "db_instance" },
}));

describe("Firestore Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUserProfile", () => {
    it("creates a new profile if it does not already exist", async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      await createUserProfile("user_123", { displayName: "New Warrior" });

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: "doc_ref", id: "user_123" }),
        expect.objectContaining({
          uid: "user_123",
          displayName: "New Warrior",
          ecoPoints: 0,
          level: "Seed 🌱",
          levelIcon: "🌱",
          streak: 0,
          totalSaved: 0,
          carbonScore: 50,
          createdAt: "mock_timestamp",
          updatedAt: "mock_timestamp",
        })
      );
    });

    it("does not overwrite if the profile already exists", async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
      });

      await createUserProfile("user_123", { displayName: "Existing Warrior" });

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });

  describe("getUserProfile", () => {
    it("returns profile data if user document exists", async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ displayName: "Eco Hero", ecoPoints: 500 }),
      });

      const profile = await getUserProfile("user_123");
      expect(profile).toEqual({ displayName: "Eco Hero", ecoPoints: 500 });
    });

    it("returns null if user document does not exist", async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const profile = await getUserProfile("user_123");
      expect(profile).toBeNull();
    });
  });

  describe("updateUserProfile", () => {
    it("updates user profile with merge options", async () => {
      await updateUserProfile("user_123", { ecoPoints: 200 });

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: "doc_ref", id: "user_123" }),
        expect.objectContaining({ ecoPoints: 200, updatedAt: "mock_timestamp" }),
        { merge: true }
      );
    });
  });

  describe("saveFootprintEntry", () => {
    it("saves footprint entry and updates user score and CO2 saved", async () => {
      mockAddDoc.mockResolvedValueOnce({
        id: "footprint_doc_456",
      });

      const docId = await saveFootprintEntry({
        uid: "user_123",
        sustainabilityScore: 85,
        monthlyEmissions: 100,
        yearlyEmissions: 1200,
        transportEmissions: 20,
        foodEmissions: 20,
        energyEmissions: 40,
        shoppingEmissions: 10,
        wasteEmissions: 10,
        transport: "train",
        foodHabits: "vegan",
      });

      expect(docId).toBe("footprint_doc_456");
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: "col_ref" }),
        expect.objectContaining({
          uid: "user_123",
          sustainabilityScore: 85,
          monthlyEmissions: 100,
          createdAt: "mock_timestamp",
        })
      );
      // It should trigger updating user profile score
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: "doc_ref", id: "user_123" }),
        expect.objectContaining({
          carbonScore: 85,
          totalSaved: 15, // 100 * 0.15 = 15
        }),
        { merge: true }
      );
    });
  });

  describe("getUserFootprints & getLatestFootprint", () => {
    it("returns formatted list of footprints", async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          { id: "fp1", data: () => ({ sustainabilityScore: 90 }) },
          { id: "fp2", data: () => ({ sustainabilityScore: 80 }) },
        ],
      });

      const footprints = await getUserFootprints("user_123", 2);
      expect(footprints).toEqual([
        { id: "fp1", sustainabilityScore: 90 },
        { id: "fp2", sustainabilityScore: 80 },
      ]);
    });

    it("getLatestFootprint returns first element or null", async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ id: "fp1", data: () => ({ sustainabilityScore: 90 }) }],
      });

      const latest = await getLatestFootprint("user_123");
      expect(latest).toEqual({ id: "fp1", sustainabilityScore: 90 });
    });
  });
});
