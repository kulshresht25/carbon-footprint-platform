import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIChatbot } from "./AIChatbot";
import { SessionProvider } from "@/contexts/SessionContext";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock framer-motion to bypass animations
vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }: any, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    button: React.forwardRef(({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }: any, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Firebase app
vi.mock("@/lib/firebase", () => ({
  default: { name: "mock-firebase-app" },
  auth: {},
  db: {},
  googleProvider: {},
}));

// Mock Firebase AI SDK
const mockSendMessageStream = vi.fn();
const mockStartChat = vi.fn(() => ({
  sendMessageStream: mockSendMessageStream,
}));

const mockGenerativeModel = {
  startChat: mockStartChat,
};

vi.mock("firebase/ai", () => {
  return {
    getAI: vi.fn(),
    GoogleAIBackend: vi.fn(),
    getGenerativeModel: vi.fn(() => mockGenerativeModel),
  };
});

describe("AIChatbot Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock_api_key_123";
    localStorage.clear();
  });

  const openChat = async (user: ReturnType<typeof userEvent.setup>) => {
    // The floating button is the only button rendered initially
    const openBtn = screen.getByRole("button");
    await user.click(openBtn);
    expect(screen.getByText("Eco AI Coach")).toBeInTheDocument();
  };

  it("opens the chatbot and displays the greeting message", async () => {
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <AIChatbot />
      </SessionProvider>
    );

    // Initial state: chat window should not be visible
    expect(screen.queryByText("Eco AI Coach")).not.toBeInTheDocument();

    await openChat(user);

    // Verify greetings
    expect(
      screen.getByText(/Hi! I'm your AI Sustainability Coach/i)
    ).toBeInTheDocument();
  });

  it("successfully streams a response when Gemini API resolves", async () => {
    const user = userEvent.setup();

    // Mock successful streaming response
    mockSendMessageStream.mockResolvedValueOnce({
      stream: (async function* () {
        yield { text: () => "Here is " };
        yield { text: () => "my eco advice!" };
      })(),
    });

    render(
      <SessionProvider>
        <AIChatbot />
      </SessionProvider>
    );

    await openChat(user);

    // Type and send message
    const input = screen.getByPlaceholderText("Ask about eco tips...");
    await user.type(input, "how to reduce emissions{Enter}");

    // Verify user message appears
    expect(screen.getByText("how to reduce emissions")).toBeInTheDocument();

    // Verify streamed response concatenated
    await waitFor(() => {
      expect(screen.getByText("Here is my eco advice!")).toBeInTheDocument();
    });
  });

  it("falls back to local mock responses when Gemini API throws an error", async () => {
    const user = userEvent.setup();

    // Mock API failure
    mockSendMessageStream.mockRejectedValueOnce(new Error("API Overload"));

    render(
      <SessionProvider>
        <AIChatbot />
      </SessionProvider>
    );

    await openChat(user);

    // Type and send message that contains keyword "cycling"
    const input = screen.getByPlaceholderText("Ask about eco tips...");
    await user.type(input, "Is cycling better than metro?{Enter}");

    // Verify fallback response is shown
    await waitFor(() => {
      expect(
        screen.getByText(/Cycling vs Metro comparison/i)
      ).toBeInTheDocument();
    });
  });

  it("falls back to local mock responses when API key is missing", async () => {
    const user = userEvent.setup();
    // Simulate missing API key
    delete (process.env as any).NEXT_PUBLIC_FIREBASE_API_KEY;

    render(
      <SessionProvider>
        <AIChatbot />
      </SessionProvider>
    );

    await openChat(user);

    // Type and send message with keyword "flight"
    const input = screen.getByPlaceholderText("Ask about eco tips...");
    await user.type(input, "how much co2 does a flight emit?{Enter}");

    // Verify fallback response is shown
    await waitFor(() => {
      expect(
        screen.getByText(/Flight emissions vary by distance/i)
      ).toBeInTheDocument();
    });
  });
});
