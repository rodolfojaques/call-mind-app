import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import { Button } from "../Button";
import { StyledModalConfirm } from "./style";

function ModalConfirmation({
  dia,
  open,
  setOpen,
  evento,
  paciente,
  psicologo,
}) {
  const [newEventState, setNewEventState] = useState({});
  useEffect(() => {
    setNewEventState(evento);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const updateCalendars = (res) => {
    const newEvent = {
      ...evento,
      paciente: paciente,
      psicologo: psicologo,
      disponivel: false,
      link: res?.data?.data.hangoutLink,
      id_reuniao: res?.data?.data.id,
    };

    const newPaciente = {
      calendar: {
        ...paciente.calendar,
        [`${dia}`]: {
          ...paciente.calendar[`${dia}`],
          [`hora${evento.horario.split(":")[0]}`]: newEvent,
        },
      },
    };

    API.patch(`/patients/${paciente.id}`, newPaciente)
      .then((res) => setNewEventState(newEvent))
      .catch((erro) => console.log(erro));
    API.patch(`/psychologists/${psicologo.id}`, newPaciente).catch((erro) =>
      console.log(erro)
    );
  };

  const googleResponse = (res) => {
    const { code } = res;
    axios
      .post("http://localhost:4000/api/create-tokens", { code })
      .then((res) => {
        axios
          .post("http://localhost:4000/api/create-event", {
            summary: `Consulta de ${paciente?.name} com ${psicologo?.name}`,
            description: `Queixas do paciente: ${paciente?.complaint}`,
            location: "Online",
            startDateTime: "2022-07-12T14:30",
            endDateTime: "2022-07-12T14:40",
            attendees: [{ email: paciente.email }, { email: psicologo.email }],
          })
          .then((res) => {
            toast.success("Evento Agendado com sucesso!");
            updateCalendars(res);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  };

  const login = useGoogleLogin({
    onSuccess: (code) => {
      googleResponse(code);
    },
    scope: "openid email profile https://www.googleapis.com/auth/calendar",
    flow: "auth-code",
    onError: (error) => console.log(error),
  });

  return (
    <StyledModalConfirm open={open} onClose={() => setOpen(false)}>
      <div className="buttonDiv">
        {newEventState.disponivel ? (
          <Button
            onclick={login}
            nameButton="Confirmar"
            backcolor="#54BAB9"
            size="100px"
            sizeY="50px"
          />
        ) : (
          <a href={`${evento.link}`} target="_blank" rel="noreferrer">
            <Button
              nameButton="Ir para chamada"
              backcolor="#54BAB9"
              size="100px"
              sizeY="50px"
            />
          </a>
        )}
      </div>
    </StyledModalConfirm>
  );
}

export default ModalConfirmation;
