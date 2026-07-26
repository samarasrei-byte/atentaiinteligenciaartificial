import ConversationalChatLP from "@/components/chat-lp/ConversationalChatLP";
import { consorcioPlanejadoConfig } from "@/components/chat-lp/scripts/consorcioPlanejado";

export default function ConsorcioPlanejadoChat() {
  return <ConversationalChatLP config={consorcioPlanejadoConfig} />;
}
