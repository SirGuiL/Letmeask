import { useHistory, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";
import { Question } from "../components/Question";

import logoImg from "../assets/images/logo.svg";
import deleteImg from "../assets/images/delete.svg";
import checkImg from "../assets/images/check.svg";
import answerImg from "../assets/images/answer.svg";

import "../styles/room.scss";

// import { useAuth } from "../hooks/useAuth";
import { useRoom } from "../hooks/useRoom";
import { database } from "../services/firebase";

type RoomParams = {
  id: string;
};

export function AdminRoom() {
  const history = useHistory();

  const params = useParams<RoomParams>();

  const roomId = params.id;

  const { questions, title } = useRoom(roomId);

  async function handleEndRoom() {
    toast(
      (t) => (
        <span className="toast-container">
          Has certainty want to delete the room?
          <button className="button-toast" onClick={handleDelete}>
            Yes
          </button>
          <button className="button-toast" onClick={() => toast.dismiss(t.id)}>
            No
          </button>
        </span>
      ),
      {
        duration: 3000,
        icon: "😢",
        style: {
          fontSize: "28px",
          display: "flex",
          gap: "10px",
        },
      }
    );
  }

  async function handleDelete() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    });

    history.push("/");
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    });
  }

  async function handleDeleteQuestion(questionId: string) {
    toast(
      (t) => (
        <span className="toast-container">
          Has certainty want to delete the question?
          <button
            className="button-toast"
            onClick={() => {
              database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
              toast.success("Question successfully deleted");
              toast.dismiss(t.id);
            }}
          >
            Yes
          </button>
          <button className="button-toast" onClick={() => toast.dismiss(t.id)}>
            No
          </button>
        </span>
      ),
      {
        duration: 3000,
        icon: "😢",
        style: {
          fontSize: "28px",
          display: "flex",
          gap: "10px",
        },
      }
    );
  }

  return (
    <div id="page-room">
      <Toaster />
      <header>
        <div className="content">
          <img src={logoImg} alt="letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={handleEndRoom}>
              Encerrar sala
            </Button>
          </div>
        </div>
      </header>
      <main className="content">
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.map((question) => {
            return (
              <Question
                key={question.id}
                author={question.author}
                content={question.content}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckQuestionAsAnswered(question.id)}
                    >
                      <img
                        src={checkImg}
                        alt="Marcar pergunta como respondida"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={answerImg} alt="Dar destaque à pergunta" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
            );
          })}
        </div>
      </main>
    </div>
  );
}
