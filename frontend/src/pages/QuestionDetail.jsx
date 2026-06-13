import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AskQuestionModal from "../components/AskQuestionModal";
import { useFAQ } from "../context/FAQContext";
import { generateSummaryApi, fetchPeerAnswers, createPeerAnswer } from "../api/faqApi";

const defaultQuestion = {
  title: "Question Not Found",
  category: "General",
  description: "This question could not be found.",
  hashtags: [],
  votes: 0,
  voted: false,
  bookmarked: false,
  author: "Unknown",
  time: "N/A",
  views: 0,
  answers: [],
};

function QuestionDetail() {
  const { questions, upvoteQuestion, bookmarkQuestion, addAnswer, upvoteAnswer } = useFAQ();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [peerAnswers, setPeerAnswers] = useState([]);
  const [peerAnswerText, setPeerAnswerText] = useState("");

  useEffect(() => {
    const loadPeerAnswers = async () => {
      if (!question?.id) return;

      try {
        const response = await fetchPeerAnswers(question.id);
        setPeerAnswers(response.data || []);
      } catch (err) {
        console.warn("Peer answers unavailable:", err.message);
      }
    };

    loadPeerAnswers();
  }, [question?.id]);

  const question = questions.find((q) => String(q.id) === String(id)) || defaultQuestion;

  const toggleQVote = () => {
    if (question.id) upvoteQuestion(question.id);
  };

  const toggleBookmark = () => {
    if (question.id) bookmarkQuestion(question.id);
  };

  const toggleAnswerVote = (answerId) => {
    if (question.id) upvoteAnswer(question.id, answerId);
  };

  const handleSubmitReply = () => {
    if (replyText.trim() && question.id) {
      addAnswer(question.id, replyText);
      setReplyText("");
    }
  };

  const handleSubmitPeerAnswer = async () => {
    if (!peerAnswerText.trim() || !question.id) return;

    try {
      const response = await createPeerAnswer({
        faqId: question.id,
        content: peerAnswerText
      });

      setPeerAnswers((prev) => [response.data, ...prev]);
      setPeerAnswerText("");
    } catch (err) {
      console.warn("Failed to submit peer answer:", err.message);
    }
  };

  const generateSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await generateSummaryApi({
        question: question.title,
        answers: (question.answers || []).map((answer) => answer.content)
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.warn("Failed to generate summary:", err.message);
      setSummary("Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <Topbar openModal={() => setShowModal(true)} />
        <main className="content">
          <Link to="/questions" className="back-link">← Back to Questions</Link>

          <div className="detail-card">
            <div className="detail-top">
              <div className="vote-col">
                <button className={`upvote ${question.voted ? "upvoted" : ""}`} onClick={toggleQVote}>▲</button>
                <span className="vote-count">{question.votes}</span>
              </div>

              <div className="detail-body">
                <div className="q-tags">
                  {question.answers && question.answers.length > 0 && <span className="tag answered">✓ Answered</span>}
                  <span className="tag category">{question.category}</span>
                </div>

                <h1 className="detail-title">{question.title}</h1>
                <button
                  onClick={generateSummary}
                  style={{
                    marginTop: "12px",
                    marginBottom: "12px",
                    padding: "8px 14px",
                    cursor: "pointer"
                  }}
                >
                  ✨ Generate TL;DR
                </button>

                {summaryLoading && (
                <div style={{ marginBottom: "12px" }}>
                Generating summary...
                </div>
                )}

                {summary && (
                <div
                style={{
                marginBottom: "16px",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#fafafa"
                }}
                >
                <strong>AI Summary</strong>
                <p>{summary}</p>
                </div>
                )}



                <p className="detail-description">{question.description}</p>

                <div className="detail-hashtags">
                  {question.hashtags.map((tag) => (
                    <span key={tag} className="hashtag">#{tag}</span>
                  ))}
                </div>

                <div className="detail-meta">
                  <span>Asked by <strong>{question.author}</strong></span>
                  <span>{question.time}</span>
                  <span>👁 {question.views} views</span>
                  <button
                    className={`bookmark-btn ${question.bookmarked ? "bookmarked" : ""}`}
                    onClick={toggleBookmark}
                  >
                    {question.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <section className="answers-section">
            <h2 className="answers-heading">
              {question.answers ? question.answers.length : 0} {question.answers && question.answers.length === 1 ? "Answer" : "Answers"}
            </h2>

            {question.answers && question.answers.map((answer) => (
              <div key={answer.id} className={`answer-card ${answer.isBest ? "best-answer" : ""}`}>
                <div className="vote-col">
                  <button
                    className={`upvote ${answer.voted ? "upvoted" : ""}`}
                    onClick={() => toggleAnswerVote(answer.id)}
                  >
                    ▲
                  </button>
                  <span className="vote-count">{answer.votes}</span>
                </div>

                <div className="answer-body">
                  {answer.isBest && (
                    <span className="best-badge">✓ Best Answer</span>
                  )}
                  <p className="answer-text">{answer.content}</p>
                  <div className="answer-meta">
                    <div className="answer-author">
                      <div className="avatar small">{answer.avatar}</div>
                      <strong>{answer.author}</strong>
                    </div>
                    <span className="answer-time">{answer.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="answers-section" style={{ marginTop: "24px" }}>
            <h2 className="answers-heading">Peer Experiences</h2>

            {peerAnswers.length === 0 ? (
              <p className="no-answers" style={{ color: "#666", fontStyle: "italic", marginBottom: "16px" }}>
                No peer experiences shared yet. Be the first to share!
              </p>
            ) : (
              peerAnswers.map((answer) => (
                <div className="answer-card" key={answer._id || answer.id} style={{ borderLeft: "4px solid #10b981" }}>
                  <div className="answer-body">
                    <p className="answer-text">{answer.content}</p>
                    <div className="answer-meta" style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                      <span>Shared by <strong>{answer.authorName}</strong></span>
                      <span style={{ marginLeft: "8px", textTransform: "capitalize", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px" }}>
                        {answer.authorRole}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <textarea
              className="reply-textarea"
              value={peerAnswerText}
              onChange={(e) => setPeerAnswerText(e.target.value)}
              placeholder="Share peer guidance or internship experience..."
              style={{ marginTop: "16px" }}
            />

            <button className="reply-submit" onClick={handleSubmitPeerAnswer} style={{ background: "#10b981" }}>
              Submit Peer Experience
            </button>
          </section>

          <section className="reply-section">
            <h2 className="answers-heading">Your Answer</h2>
            <textarea
              className="reply-textarea"
              placeholder="Write your answer here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button className="reply-submit" onClick={handleSubmitReply}>Post Your Answer</button>
          </section>
        </main>
      </div>
      <AskQuestionModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default QuestionDetail;
