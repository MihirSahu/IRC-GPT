import { ChatApp } from "@/components/chat-app";
import { getDefaultProvider } from "@/lib/models";

export default function Home() {
  return <ChatApp initialProvider={getDefaultProvider()} />;
}
