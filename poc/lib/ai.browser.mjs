// 공유용 브라우저 버전: API 키를 페이지에 둘 수 없으므로 흉내 모드만 쓴다.
import { mockChat, mockScreen } from "./ai.mock.mjs";
export const aiMode = () => "mock";
export const chatEdit = async (a) => mockChat(a);
export const generateScreen = async (a) => mockScreen(a);
