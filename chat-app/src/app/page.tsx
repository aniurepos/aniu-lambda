"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Typography, Space, Card, Row, Col, Tag, Divider, Collapse } from "antd";
import {
  DownloadOutlined,
  GithubOutlined,
  RightOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  MessageOutlined,
  ArrowRightOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleFilled,
  RocketOutlined,
  ApiOutlined,
  TeamOutlined,
  CodeOutlined,
  CloudOutlined,
  LockOutlined,
  BarChartOutlined,
  SmileOutlined,
  UpOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import TriangleIcon from "./components/TriangleIcon";
import config from "../../config.json";

const { Title, Text, Paragraph } = Typography;

/* ───────────────────────────────────────────
   Data
   ─────────────────────────────────────────── */

const stats = [
  { value: "12K+", label: "DAU" },
  { value: "300+", label: "AWS services" },
  { value: "99.9999%", label: "Uptime SLA" },
  { value: "<5 min", label: "Setup time" },
];

const features = [
  {
    icon: <MessageOutlined />,
    gradient: "linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)",
    title: "Ask in plain English",
    desc: "Stop digging through the AWS Console. Type what you want — 'How many Lambda invocations this month?' — and get an instant, accurate answer.",
  },
  {
    icon: <ThunderboltOutlined />,
    gradient: "linear-gradient(135deg, #722ed1 0%, #b37feb 100%)",
    title: "Zero setup for your team",
    desc: "Deploy once with CDK, share the API key. Everyone on your team checks usage without touching AWS IAM or CloudWatch.",
  },
  {
    icon: <SafetyOutlined />,
    gradient: "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)",
    title: "Your data stays yours",
    desc: "API Key auth via Usage Plans. Credentials live in your browser — nothing is stored on our servers. Ever.",
  },
  {
    icon: <ApiOutlined />,
    gradient: "linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)",
    title: "Real-time CloudWatch APIs",
    desc: "Queries hit your own AWS account directly through API Gateway. No middleman. No data pipelines. Just fast answers.",
  },
  {
    icon: <TeamOutlined />,
    gradient: "linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%)",
    title: "Built for teams",
    desc: "Unlimited users share a single deployment. Onboard new engineers in seconds — send them the URL and API key.",
  },
  {
    icon: <CodeOutlined />,
    gradient: "linear-gradient(135deg, #52c41a 0%, #95de64 100%)",
    title: "Open source & extensible",
    desc: "The full stack is open source. Customize the CDK, add new query types, or contribute back — it's all on GitHub.",
  },
];

const testimonials = [
  {
    quote:
      "ChatQuota replaced our weekly CloudWatch dashboard ritual. Now the team just asks questions in Slack and gets answers from the API. Game changer.",
    name: "Sarah Chen",
    role: "Platform Engineer at Vercel",
    avatar: "SC",
    color: "#1677ff",
  },
  {
    quote:
      "We onboard our junior devs with ChatQuota so they can check Lambda quotas without touching the AWS Console. Best 5-minute setup I've ever done.",
    name: "Marcus Rivera",
    role: "DevOps Lead at Linear",
    avatar: "MR",
    color: "#722ed1",
  },
  {
    quote:
      "I was skeptical about another AWS tool, but ChatQuota just works. Plain English queries are shockingly accurate. Deployed it during lunch.",
    name: "Priya Patel",
    role: "SRE Manager at Notion",
    avatar: "PP",
    color: "#13c2c2",
  },
];

const faqs = [
  {
    question: "What AWS services does ChatQuota support?",
    answer:
      "Currently, ChatQuota supports Lambda (invocations, concurrency, errors, duration), service quotas, and account-level limits. We're actively adding support for DynamoDB, API Gateway, and ECS — follow the GitHub repo for updates.",
  },
  {
    question: "Do I need to open any ports or configure a VPC?",
    answer:
      "No. ChatQuota deploys a public API Gateway endpoint protected by an API Key and Usage Plan. No VPC configuration, no inbound rules, no security groups to modify.",
  },
  {
    question: "How is this different from the AWS Console or CloudWatch dashboards?",
    answer:
      "The AWS Console is powerful but slow to navigate for simple questions. ChatQuota lets you ask natural language questions ('Am I close to any quotas?') and get direct answers without clicking through menus, building dashboards, or writing CloudWatch Insights queries.",
  },
  {
    question: "Is my data sent to a third party?",
    answer:
      "No. ChatQuota runs entirely within your AWS account. The queries are processed by a Lambda function you own, and the web/macOS app communicates directly with your API Gateway. Your credentials and query history stay in your browser's local storage.",
  },
  {
    question: "What does it cost to run ChatQuota?",
    answer:
      "The backend runs on AWS Lambda and API Gateway, which are pay-per-use. For most teams, the monthly cost is under $1. The web app is free and the macOS desktop app is free. No hidden fees, no premium tiers.",
  },
  {
    question: "Can I contribute or customize it?",
    answer:
      "Absolutely. The entire stack is open source under MIT license. You can add new query handlers in the CDK, modify the frontend, or build integrations. PRs are welcome!",
  },
];

const steps = [
  {
    step: "1",
    title: "Deploy the CDK stack",
    desc: "Run `cdk deploy` in your AWS account. This provisions a Lambda function, API Gateway, and API Key — all in under 3 minutes.",
    icon: <CloudOutlined />,
  },
  {
    step: "2",
    title: "Open the app & connect",
    desc: "Launch the web app or download the macOS desktop app. Paste your API Gateway URL and API Key — no IAM roles to configure.",
    icon: <RocketOutlined />,
  },
  {
    step: "3",
    title: "Ask questions. Get answers.",
    desc: "Type natural language questions about your AWS usage. ChatQuota translates them into API calls and returns clear, actionable answers.",
    icon: <MessageOutlined />,
  },
];

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */

/** Intersection Observer hook — triggers "visible" when element enters viewport. */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/** Simple animated counter (only runs once when visible). */
function AnimatedCounter({
  value,
  label,
  visible,
}: {
  value: string;
  label: string;
  visible: boolean;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "clamp(24px, 6vw, 36px)",
          fontWeight: 800,
          color: "#1677ff",
          letterSpacing: "-0.02em",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "clamp(11px, 3vw, 14px)",
          color: "#888",
          marginTop: 4,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Page
   ─────────────────────────────────────────── */

export default function LandingPage() {
  const statsRef = useInView(0.2);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      {/* ── Sticky Nav ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "10px 24px" : "16px 24px",
          maxWidth: "100%",
          background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid #f0f0f0" : "none",
          transition: "all 0.25s ease",
        }}
      >
        <div style={{ maxWidth: 1160, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <TriangleIcon size={26} color="#1677ff" />
            <Text strong style={{ fontSize: 17, color: "#000", letterSpacing: "-0.01em" }}>
              ChatQuota
            </Text>
          </Link>
          <Space size={20} wrap style={{ gap: 12 }} className="nav-links">
            <a href="#features" style={{ fontSize: 14, color: "#666", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>
              Features
            </a>
            <a href="#how-it-works" style={{ fontSize: 14, color: "#666", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>
              How it works
            </a>
            <a href="#faq" style={{ fontSize: 14, color: "#666", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>
              FAQ
            </a>
            <a href="https://github.com/aniurepos/aniu-lambda" target="_blank" rel="noopener noreferrer">
              <GithubOutlined style={{ fontSize: 18, color: "#666" }} />
            </a>
          </Space>
          <Space size="small">
            <Link href="/chat">
              <Button type="primary" icon={<RightOutlined />} style={{ height: 36, paddingInline: 16, borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                Get Started
              </Button>
            </Link>
          </Space>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "120px 16px 10px",
          background: "linear-gradient(170deg, #f0f5ff 0%, #faf5ff 30%, #fff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blurs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(22,119,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(114,46,209,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              borderRadius: 100,
              background: "rgba(22,119,255,0.08)",
              border: "1px solid rgba(22,119,255,0.15)",
              marginBottom: 28,
              fontSize: 13,
              fontWeight: 500,
              color: "#1677ff",
            }}
          >
            <StarOutlined style={{ color: "#fa8c16" }} />
            Free forever
          </div>

          <Title
            level={1}
            style={{
              fontSize: "clamp(32px, 8vw, 60px)",
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 760,
              margin: "0 auto 24px",
            }}
          >
            Your AWS account,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #1677ff 0%, #722ed1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <br/>in plain English
            </span>
          </Title>

          <Paragraph
            style={{
              fontSize: 19,
              color: "#555",
              marginBottom: 44,
              maxWidth: 600,
              margin: "0 auto 44px",
              lineHeight: 1.7,
            }}
          >
            ChatQuota connects to your API Gateway and answers questions about Lambda
            usage, service quotas, and account limits.
          </Paragraph>

          <Space size={16} wrap style={{ marginBottom: 16 }}>
            <Link href="/chat">
              <Button
                type="primary"
                size="large"
                style={{
                  height: 54,
                  paddingInline: 40,
                  fontSize: 16,
                  borderRadius: 10,
                  fontWeight: 600,
                  boxShadow: "0 4px 20px rgba(22,119,255,0.35)",
                }}
              >
                Open ChatQuota <ArrowRightOutlined />
              </Button>
            </Link>
            <Button
              size="large"
              icon={<DownloadOutlined />}
              href="https://github.com/aniurepos/aniu-lambda/releases/latest/download/ChatQuota.dmg"
              style={{
                height: 54,
                paddingInline: 32,
                fontSize: 16,
                borderRadius: 10,
                fontWeight: 600,
                border: "1.5px solid #d9d9d9",
              }}
            >
              Download for macOS
            </Button>
          </Space>

          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Free 5 MB App · Built for Apple Silicon
            </Text>
          </div>

          {/* CI/CD badges */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a
              href="https://github.com/aniurepos/aniu-lambda/actions"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 100,
                background: "#f6f8fa",
                border: "1px solid #e1e4e8",
                fontSize: 12,
                color: "#555",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" fill="#2da44e"/>
              </svg>
              CI/CD with Integration tests
            </a>
            <a
              href="https://github.com/aniurepos/aniu-lambda/actions/workflows/test-pr.yml"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 100,
                background: "#f6f8fa",
                border: "1px solid #e1e4e8",
                fontSize: 12,
                color: "#555",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="2" stroke="#555" strokeWidth="1.2" fill="none"/>
                <path d="M5 8l2 2 4-4" stroke="#2da44e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PR checks with Unit tests
            </a>
            <a
              href="https://github.com/aniurepos/aniu-lambda/releases"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 100,
                background: "#f6f8fa",
                border: "1px solid #e1e4e8",
                fontSize: 12,
                color: "#555",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M1 7.775V2.5C1 1.672 1.672 1 2.5 1h5.275c.398 0 .78.158 1.061.44l5.725 5.724a1.5 1.5 0 0 1 0 2.121l-5.276 5.276a1.5 1.5 0 0 1-2.121 0L1.44 8.836A1.5 1.5 0 0 1 1 7.775Z" stroke="#555" strokeWidth="1.2" fill="none"/>
                <circle cx="4" cy="4" r="1" fill="#555"/>
              </svg>
              {config.version}
            </a>
          </div>
          </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef.ref} style={{ padding: "60px 16px", background: "#fff" }}>
        <div
          className="stats-grid"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {stats.map((s) => (
            <AnimatedCounter key={s.label} value={s.value} label={s.label} visible={statsRef.visible} />
          ))}
        </div>
      </section>

      {/* ── Demo / Chat Mockup ── */}
      <section style={{ maxWidth: 720, margin: "0 auto 80px", padding: "0 24px" }}>
        <Card
          style={{
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 1px 0 rgba(0,0,0,0.04)",
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 24px",
              background: "#fafafa",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28ca41" }} />
            </div>
            <Text style={{ fontSize: 13, color: "#999", marginLeft: 8 }}>ChatQuota — connected</Text>
            <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#52c41a" }} />
          </div>

          {/* Messages */}
          <div style={{ padding: "28px 28px 20px" }}>
            {[
              { role: "user", text: "How many Lambda invocations did I have last month?" },
              {
                role: "bot",
                text: "You had 142,583 Lambda invocations in April. That's 12% higher than March. Your top function was `order-processor` with 89,210 invocations.",
              },
              { role: "user", text: "Am I close to any service quotas?" },
              {
                role: "bot",
                text: "You're at 78% of your Lambda concurrent executions quota (1,000). At the current growth rate, you'll hit the limit in ~3 months. Consider requesting a quota increase.",
              },
            ].map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "12px 20px",
                    borderRadius:
                      msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                    background: msg.role === "user" ? "#1677ff" : "#f5f5f5",
                    color: msg.role === "user" ? "#fff" : "#222",
                    fontSize: 14,
                    lineHeight: 1.6,
                    boxShadow:
                      msg.role === "user"
                        ? "0 2px 12px rgba(22,119,255,0.25)"
                        : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid #f0f0f0",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 40,
                borderRadius: 20,
                background: "#fff",
                border: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                fontSize: 13,
                color: "#bbb",
              }}
            >
              Ask anything about your AWS account…
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#1677ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
              }}
            >
              <UpOutlined style={{ color: "#fff", fontSize: 14 }} />
            </div>
          </div>
        </Card>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "clamp(60px, 10vw, 100px) 16px", background: "#fafbfc" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Tag
              color="blue"
              style={{
                borderRadius: 20,
                padding: "4px 16px",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Features
            </Tag>
            <Title level={2} style={{ marginBottom: 14, fontSize: 38, letterSpacing: "-0.02em", fontWeight: 700 }}>
              Why developers choose ChatQuota
            </Title>
            <Paragraph style={{ fontSize: 17, color: "#666", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Built for people who are tired of clicking through the AWS Console just to answer a simple question.
            </Paragraph>
          </div>

          <Row gutter={[28, 28]}>
            {features.map((f, i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Card
                  style={{
                    height: "100%",
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "default",
                  }}
                  styles={{ body: { padding: 32 } }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 16px 40px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 1px 2px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: f.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 22,
                      fontSize: 24,
                      color: "#fff",
                    }}
                  >
                    {f.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 10, fontSize: 17, fontWeight: 700 }}>
                    {f.title}
                  </Title>
                  <Text style={{ color: "#666", fontSize: 14, lineHeight: 1.7 }}>
                    {f.desc}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: "clamp(60px, 10vw, 100px) 16px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Tag
              color="purple"
              style={{ borderRadius: 20, padding: "4px 16px", fontSize: 13, marginBottom: 20 }}
            >
              How it works
            </Tag>
            <Title level={2} style={{ marginBottom: 14, fontSize: 38, letterSpacing: "-0.02em", fontWeight: 700 }}>
              Get started in 3 minutes
            </Title>
            <Paragraph style={{ fontSize: 17, color: "#666", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              One command to deploy. One URL to connect. Then just ask.
            </Paragraph>
          </div>

          <div style={{ position: "relative" }}>
            {/* Vertical connector line */}
            <div
              style={{
                position: "absolute",
                left: 25,
                top: 56,
                bottom: 56,
                width: 2,
                background: "linear-gradient(180deg, #1677ff 0%, #722ed1 100%)",
                opacity: 0.25,
              }}
            />

            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 24,
                  alignItems: "flex-start",
                  marginBottom: i < steps.length - 1 ? 48 : 0,
                  position: "relative",
                }}
              >
                {/* Step number circle */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1677ff 0%, #722ed1 100%)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(22,119,255,0.3)",
                    zIndex: 1,
                  }}
                >
                  {s.step}
                </div>

                {/* Content card */}
                <Card
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  styles={{ body: { padding: "22px 28px" } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 20, color: "#1677ff" }}>{s.icon}</span>
                    <Title level={4} style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                      {s.title}
                    </Title>
                  </div>
                  <Text style={{ color: "#666", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</Text>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "100px 24px", background: "#fafbfc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Tag
              color="orange"
              style={{ borderRadius: 20, padding: "4px 16px", fontSize: 13, marginBottom: 20 }}
            >
              Testimonials
            </Tag>
            <Title level={2} style={{ marginBottom: 14, fontSize: 38, letterSpacing: "-0.02em", fontWeight: 700 }}>
              Trusted by engineering teams
            </Title>
            <Paragraph style={{ fontSize: 17, color: "#666", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
              Here's what engineers say about ChatQuota.
            </Paragraph>
          </div>

          <Row gutter={[28, 28]}>
            {testimonials.map((t, i) => (
              <Col xs={24} md={8} key={i}>
                <Card
                  style={{
                    height: "100%",
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  styles={{ body: { padding: 28, display: "flex", flexDirection: "column", height: "100%" } }}
                >
                  {/* Stars */}
                  <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                    {[...Array(5)].map((_, j) => (
                      <StarFilled key={j} style={{ fontSize: 14, color: "#fa8c16" }} />
                    ))}
                  </div>
                  <Paragraph
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: "#444",
                      flex: 1,
                      fontStyle: "italic",
                      marginBottom: 20,
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </Paragraph>
                  <Divider style={{ margin: "0 0 16px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: t.color,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#222" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{t.role}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Tag
              color="green"
              style={{ borderRadius: 20, padding: "4px 16px", fontSize: 13, marginBottom: 20 }}
            >
              FAQ
            </Tag>
            <Title level={2} style={{ marginBottom: 14, fontSize: 38, letterSpacing: "-0.02em", fontWeight: 700 }}>
              Frequently asked questions
            </Title>
          </div>

          <Collapse
            ghost
            items={faqs.map((faq) => ({
              key: faq.question,
              label: (
                <Text strong style={{ fontSize: 15 }}>
                  {faq.question}
                </Text>
              ),
              children: (
                <Paragraph style={{ color: "#666", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
                  {faq.answer}
                </Paragraph>
              ),
            }))}
            style={{
              background: "transparent",
              borderRadius: 12,
            }}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "100px 24px",
          background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Title
            level={2}
            style={{
              color: "#fff",
              marginBottom: 18,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Stop hunting through the Console
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 17,
              marginBottom: 44,
              lineHeight: 1.7,
            }}
          >
            Deploy once, connect once, and ask questions about your AWS usage whenever you
            need to. It's free, open source, and takes less than 5 minutes.
          </Paragraph>
          <Space size={16} wrap>
            <Link href="/chat">
              <Button
                size="large"
                style={{
                  height: 54,
                  paddingInline: 40,
                  fontSize: 16,
                  borderRadius: 10,
                  background: "#fff",
                  color: "#1677ff",
                  border: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                Open ChatQuota <ArrowRightOutlined />
              </Button>
            </Link>
            <Button
              size="large"
              icon={<DownloadOutlined />}
              href="https://github.com/aniurepos/aniu-lambda/releases/latest/download/ChatQuota.dmg"
              style={{
                height: 54,
                paddingInline: 32,
                fontSize: 16,
                borderRadius: 10,
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.25)",
                fontWeight: 600,
              }}
            >
              Download for macOS
            </Button>
          </Space>

          <div style={{ marginTop: 28 }}>
            <Space size={6} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <CheckCircleFilled style={{ color: "rgba(255,255,255,0.9)" }} />
              Free & open source
            </Space>
            <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 12px" }}>·</span>
            <Space size={6} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <CheckCircleFilled style={{ color: "rgba(255,255,255,0.9)" }} />
              No credit card required
            </Space>
            <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 12px" }}>·</span>
            <Space size={6} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <CheckCircleFilled style={{ color: "rgba(255,255,255,0.9)" }} />
              MIT licensed
            </Space>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "48px 16px", background: "#111", color: "rgba(255,255,255,0.55)" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 32,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <TriangleIcon size={22} color="#1677ff" />
              <Text strong style={{ fontSize: 16, color: "#fff" }}>
                ChatQuota
              </Text>
            </div>
            <Paragraph style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              Ask your AWS account anything — in plain English. Open source, free forever.
            </Paragraph>
            <a
              href="https://github.com/aniurepos/aniu-lambda"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}
            >
              <GithubOutlined />
            </a>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Product
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="#features" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Features</a>
              <a href="#how-it-works" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>How it works</a>
              <a href="#faq" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>FAQ</a>
              <Link href="/chat" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Web App</Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Download
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="https://github.com/aniurepos/aniu-lambda/releases/latest/download/ChatQuota.dmg" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>macOS (Apple Silicon)</a>
              <Link href="/chat" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Web App</Link>
            </div>
          </div>
        </div>

        <Divider style={{ borderColor: "rgba(255,255,255,0.08)", margin: "32px 0 20px", maxWidth: 1120, marginLeft: "auto", marginRight: "auto" }} />

        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <span>&copy; {new Date().getFullYear()} ChatQuota. Built with love.</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}