import ConversationalChatLP from "@/components/chat-lp/ConversationalChatLP";
import { cartaCreditoEmpresasConfig } from "@/components/chat-lp/scripts/cartaCreditoEmpresas";

export default function CartaCreditoEmpresasChat() {
  return <ConversationalChatLP config={cartaCreditoEmpresasConfig} />;
}
