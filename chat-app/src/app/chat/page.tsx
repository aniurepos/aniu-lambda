"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Card,
  Typography,
  Form,
  Space,
  Drawer,
  Divider,
  App as AntApp,
  Tooltip,
  Switch,
  Avatar,
  Badge,
  ConfigProvider,
  theme,
} from "antd";
import {
  SendOutlined,
  KeyOutlined,
  ApiOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined,
  UserOutlined,
  RobotOutlined,
  MoonOutlined,
  SunOutlined,
  HistoryOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import TriangleIcon from "../components/TriangleIcon";

const { Title, Text } = Typography;
const { TextArea } = Input;

// ---- Types ----
type MessageRole = "user" | "bot" | "system";

interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ---- Helpers ----
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + "..." : str;
}

// ---- Component ----
export default function ChatPage() {
  const { message: antMessage } = AntApp.useApp();

  // Login state
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Chat state
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editKey, setEditKey] = useState("");
  const [darkMode, setDarkMode] = useState(true); // default dark

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation messages
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const messages = activeConv?.messages ?? [];

  // Restore saved credentials & dark mode
  useEffect(() => {
    const savedUrl = localStorage.getItem("chatApiUrl");
    const savedKey = localStorage.getItem("chatApiKey");
    const savedDark = localStorage.getItem("chatDarkMode");
    if (savedUrl) setApiUrl(savedUrl);
    if (savedKey) setApiKey(savedKey);
    if (savedDark !== null) setDarkMode(savedDark === "true");

    // Auto-connect if saved credentials exist
    if (savedUrl && savedKey) {
      setIsConnected(true);
      const id = generateId();
      const conv: Conversation = {
        id,
        title: "New Chat",
        messages: [
          {
            role: "system",
            content: "Connected. Ask me about your AWS usage!",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations([conv]);
      setActiveConvId(id);
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("chatDarkMode", String(darkMode));
  }, [darkMode]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ---- Conversation helpers ----
  const updateActiveMessages = (updater: (msgs: Message[]) => Message[]) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: updater(c.messages), updatedAt: new Date() }
          : c
      )
    );
  };

  const newConversation = () => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: "New Chat",
      messages: [
        {
          role: "system",
          content: "Connected. Ask me about your AWS usage!",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(id);
  };

  // ---- Connect handler ----
  const handleConnect = async () => {
    if (!apiUrl.trim() || !apiKey.trim()) {
      antMessage.error("Please enter both URL and API Key.");
      return;
    }

    try {
      new URL(apiUrl);
    } catch {
      antMessage.error("Invalid URL format.");
      return;
    }

    setIsConnecting(true);

    try {
      const testUrl = apiUrl.replace(/\/+$/, "") + "/";
      const res = await fetch(testUrl, {
        method: "GET",
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      localStorage.setItem("chatApiUrl", apiUrl);
      localStorage.setItem("chatApiKey", apiKey);
      setIsConnected(true);
      newConversation();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      antMessage.error(`Connection failed: ${msg}. Check URL and API Key.`);
    } finally {
      setIsConnecting(false);
    }
  };

  // ---- Send handler ----
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    setInputText("");

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    updateActiveMessages((msgs) => [...msgs, userMsg]);

    // Auto-title: use first user message as conversation title
    const conv = conversations.find((c) => c.id === activeConvId);
    if (conv && conv.title === "New Chat") {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, title: truncate(text, 40) }
            : c
        )
      );
    }

    setIsSending(true);

    try {
      const url = apiUrl.replace(/\/+$/, "") + "/";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.message || JSON.stringify(data);

      const botMsg: Message = {
        role: "bot",
        content: reply,
        timestamp: new Date(),
      };

      updateActiveMessages((msgs) => [...msgs, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      updateActiveMessages((msgs) => [
        ...msgs,
        {
          role: "system",
          content: `Error: ${msg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // ---- Key handler ----
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Settings ----
  const openSettings = () => {
    setEditUrl(apiUrl);
    setEditKey(apiKey);
    setSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    if (!editUrl.trim() || !editKey.trim()) {
      antMessage.error("URL and API Key are required.");
      return;
    }
    try {
      new URL(editUrl);
    } catch {
      antMessage.error("Invalid URL format.");
      return;
    }

    localStorage.setItem("chatApiUrl", editUrl);
    localStorage.setItem("chatApiKey", editKey);
    setApiUrl(editUrl);
    setApiKey(editKey);
    setSettingsOpen(false);
    antMessage.success("Credentials updated.");
  };

  const handleSignOut = () => {
    localStorage.removeItem("chatApiUrl");
    localStorage.removeItem("chatApiKey");
    setSettingsOpen(false);
    setIsConnected(false);
    setApiUrl("");
    setApiKey("");
    setConversations([]);
    setActiveConvId(null);
  };

  // ---- Render ----
  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
      }}
    >
    <div className="chat-layout">
      <div className="chat-main">
        {/* ---- Sidebar ---- */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <Space>
              <TriangleIcon size={20} color="#1677ff" />
              <Text strong>ChatQuota</Text>
            </Space>
            {isConnected && (
              <Tooltip title="New conversation">
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={newConversation}
                />
              </Tooltip>
            )}
          </div>

          <div className="chat-sidebar-list">
            {!isConnected && (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-tertiary)" }}>
                <ApiOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Connect to get started
                </Text>
              </div>
            )}
            {isConnected && conversations.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-tertiary)" }}>
                <HistoryOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  No conversations yet
                </Text>
              </div>
            )}
            {isConnected && conversations.map((conv) => (
              <div
                key={conv.id}
                className={`chat-history-item ${
                  conv.id === activeConvId ? "active" : ""
                }`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <div className="chat-history-item-title">{conv.title}</div>
                <div className="chat-history-item-meta">
                  {formatDate(conv.updatedAt)} · {conv.messages.length} msgs
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Tooltip title="Settings">
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={openSettings}
                  size="small"
                />
              </Tooltip>
              {isConnected && (
                <Tooltip title="Sign out">
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleSignOut}
                    size="small"
                  />
                </Tooltip>
              )}
            </Space>
          </div>
        </div>

        {/* ---- Chat Content ---- */}
        <div className="chat-content">
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderBottom: "1px solid var(--border-color)",
              background: "var(--bg-header)",
            }}
          >
            <Space>
              <Badge status={isConnected ? "success" : "default"} />
              <Text strong>
                {isConnected
                  ? activeConv
                    ? activeConv.title
                    : "ChatQuota"
                  : "Not Connected"}
              </Text>
            </Space>
            <Space size="small">
              <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
                <Button
                  icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                  type="text"
                  onClick={() => setDarkMode(!darkMode)}
                />
              </Tooltip>
              <Tooltip title="Settings">
                <Button
                  icon={<SettingOutlined />}
                  type="text"
                  onClick={openSettings}
                />
              </Tooltip>
            </Space>
          </div>

          {/* Messages / Login */}
          <div className="chat-messages-container">
            {!isConnected ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  padding: 24,
                }}
              >
                <Card
                  style={{ width: "100%", maxWidth: 420 }}
                  styles={{ body: { padding: 32 } }}
                >
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <TriangleIcon size={48} color="#1677ff" />
                    <Title level={3} style={{ margin: 0 }}>
                      ChatQuota
                    </Title>
                    <Text type="secondary">Connect to your AWS API</Text>
                  </div>

                  <Form layout="vertical" onFinish={handleConnect}>
                    <Form.Item label="API Gateway URL" name="apiUrl">
                      <Input
                        size="large"
                        placeholder="https://xxxxxxxxxx.execute-api.region.amazonaws.com/prod"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        prefix={<ApiOutlined />}
                      />
                    </Form.Item>

                    <Form.Item label="API Key" name="apiKey">
                      <Input.Password
                        size="large"
                        placeholder="Enter your x-api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        prefix={<KeyOutlined />}
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isConnecting}
                        block
                        size="large"
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </div>
            ) : !activeConv ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: "var(--text-tertiary)",
                }}
              >
                <HistoryOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <br />
                <Text type="secondary">
                  Select a conversation or start a new one
                </Text>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`message-row ${msg.role}`}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      {msg.role === "bot" && (
                        <Avatar
                          size={28}
                          icon={<RobotOutlined />}
                          style={{
                            background: "#1677ff",
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div className="message-bubble">{msg.content}</div>
                        <div className="message-time">{formatTime(msg.timestamp)}</div>
                      </div>
                      {msg.role === "user" && (
                        <Avatar
                          size={28}
                          icon={<UserOutlined />}
                          style={{
                            background: "#52c41a",
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="message-row bot">
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Avatar
                        size={28}
                        icon={<RobotOutlined />}
                        style={{ background: "#1677ff", flexShrink: 0, marginTop: 4 }}
                      />
                      <div className="message-bubble">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          {isConnected && activeConv && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                padding: "12px 16px",
                borderTop: "1px solid var(--border-color)",
                background: "var(--bg-header)",
              }}
            >
              <TextArea
                placeholder="Ask about your AWS usage..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{
                  resize: "none",
                  maxHeight: 120,
                  borderRadius: 20,
                  padding: "10px 14px",
                }}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                style={{ width: 40, height: 40 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ---- Settings Drawer ---- */}
      <Drawer
        title="Settings"
        placement="right"
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
        size="default"
        extra={
          <Button type="primary" onClick={handleSaveSettings}>
            Save
          </Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="API Gateway URL">
            <Input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              prefix={<ApiOutlined />}
            />
          </Form.Item>
          <Form.Item label="API Key">
            <Input.Password
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              prefix={<KeyOutlined />}
            />
          </Form.Item>
        </Form>

        <Divider />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Space>
            {darkMode ? <MoonOutlined /> : <SunOutlined />}
            <Text>Dark Theme</Text>
          </Space>
          <Switch
            checked={darkMode}
            onChange={(v) => setDarkMode(v)}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>

        <Divider />

        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            window.open(
              "https://github.com/aniurepos/aniu-lambda/releases",
              "_blank"
            );
          }}
          block
          style={{ marginBottom: 8 }}
        >
          Check for Updates
        </Button>

        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleSignOut}
          block
        >
          Sign Out
        </Button>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isConnected ? `Connected to: ${apiUrl}` : "Not connected"}
          </Text>
        </div>
      </Drawer>
    </div>
    </ConfigProvider>
  );
}
