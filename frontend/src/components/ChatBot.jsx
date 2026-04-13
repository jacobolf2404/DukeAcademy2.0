import { useState, useRef, useEffect } from "react";

const RESPONSES = {
  greetings: ["hello", "hi", "hey", "sup", "what's up"],
  help: ["help", "how do i", "how to", "what can"],
  grades: ["grade", "grades", "score", "gpa", "points"],
  enroll: ["enroll", "sign up", "join", "register for"],
  submit: ["submit", "submission", "turn in", "upload", "hand in"],
  assignment: ["assignment", "homework", "hw", "due date", "deadline"],
  course: ["course", "class", "courses", "catalog"],
  teacher: ["teacher", "professor", "instructor", "prof"],
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();

  if (RESPONSES.greetings.some((w) => lower.includes(w)))
    return "Hey there! &#128075; I'm the DukeAcademy assistant. Ask me about courses, assignments, grades, or how to use the platform!";

  if (RESPONSES.help.some((w) => lower.includes(w)))
    return "I can help with:\n• **Enrolling** in courses\n• **Submitting** assignments\n• **Viewing grades**\n• **Navigating** the platform\n\nJust ask me anything!";

  if (RESPONSES.grades.some((w) => lower.includes(w)))
    return "To view your grades, click **Grades** in the top navigation bar. You'll see all your submissions organized by course, with scores and teacher feedback. Grades marked 'Pending' haven't been reviewed yet.";

  if (RESPONSES.enroll.some((w) => lower.includes(w)))
    return "To enroll in a course:\n1. Go to the **Course Catalog** (home page)\n2. Click on a course\n3. Click the green **Enroll in Course** button\n\nYou can drop a course anytime from the course page.";

  if (RESPONSES.submit.some((w) => lower.includes(w)))
    return "To submit an assignment:\n1. Go to the course page\n2. Find the assignment in the **Assignments** tab\n3. Click **Submit**\n4. Write your answer or attach a file\n5. Click **Submit Assignment**\n\nYou can only submit once per assignment!";

  if (RESPONSES.assignment.some((w) => lower.includes(w)))
    return "Assignments are listed in each course's **Assignments** tab. You can see the title, due date, point value, and how many students have submitted. Assignments marked **Past Due** are past their deadline.";

  if (RESPONSES.course.some((w) => lower.includes(w)))
    return "Browse all available courses on the **home page**. Use the search bar to filter by title, instructor, or description. Click any course to see details, assignments, and enrollment options.";

  if (RESPONSES.teacher.some((w) => lower.includes(w)))
    return "Teachers can:\n• **Create courses** and assignments\n• **View rosters** of enrolled students\n• **Grade submissions** with inline feedback\n• **View analytics** with completion rates and averages";

  if (lower.includes("thank"))
    return "You're welcome! &#128522; Let me know if you need anything else.";

  return "I'm not sure about that one, but I can help with courses, assignments, grades, enrollment, and navigation. Try asking about one of those!";
}

export default function ChatBot({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: `Hi ${user?.name?.split(" ")[0] || "there"}! &#128075; I'm your DukeAcademy assistant. How can I help?` },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const botMsg = { from: "bot", text: getBotReply(input) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? "\u2715" : "\uD83D\uDCAC"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>DukeAcademy Assistant</strong>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>Always here to help</div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.from}`}>
                <div className="chatbot-bubble" dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
            />
            <button onClick={send} disabled={!input.trim()}>&#10148;</button>
          </div>
        </div>
      )}
    </>
  );
}
