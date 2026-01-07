Done. **Pure copy-paste version** 👇
No extra gyaan, no emojis, just clean `README.md` content.

---

````md
# 📊 PrepLens – Data Schema Documentation

PrepLens is a rule-based, explainable analytics platform that helps students understand **why** they are weak in coding interview preparation — not just **where**.

This document describes the core database schema used to track problem-solving behavior, detect weaknesses, schedule reviews using spaced repetition, and generate human-readable feedback.

---

## 🧠 Design Philosophy

- Explainable by design (no black-box ML)
- Behavior-driven analysis, not just scores
- Scalable for ML later
- Optimized for interview preparation insights

---

## 📦 Collections Overview

| Collection | Purpose |
|---------|--------|
| User | Stores user profile, topic-level mastery, and global stats |
| Submission | One record per problem attempt |
| Weakness | Cached, computed weaknesses with root cause |
| ReviewSchedule | Spaced repetition state per topic |
| Feedback | Rule-based explanations and suggestions |

---

## 👤 User Schema

Tracks long-term learning state of a user.

### Responsibilities
- Topic-wise mastery tracking
- Strengths & weaknesses summary
- Overall preparation statistics

### Structure
```js
User {
  email,
  name,
  topicGraph,
  strengths,
  weaknesses,
  globalStats
}
````

### topicGraph (per topic)

| Field           | Description           |
| --------------- | --------------------- |
| mastered        | Topic fully learned   |
| proficiency     | Mastery score (0–100) |
| lastReviewedAt  | Last review date      |
| nextReviewAt    | Scheduled review      |
| totalAttempts   | Problems attempted    |
| correctAttempts | Correct solutions     |

---

## 🧪 Submission Schema

Stores every problem attempt. This is the **primary data source** for all analytics.

### Structure

```js
Submission {
  userId,
  topic,
  difficulty,
  problemId,
  result,
  metadata
}
```

### result

| Field            | Description              |
| ---------------- | ------------------------ |
| correct          | Whether solved correctly |
| timeTakenSeconds | Time spent               |
| attemptNumber    | Retry count              |
| timestamp        | Attempt time             |

### metadata

| Field           | Description                 |
| --------------- | --------------------------- |
| edgeCase        | Tricky or deceptive problem |
| isRetry         | Reattempt flag              |
| previousCorrect | Regression detection        |

---

## 🚨 Weakness Schema

Represents computed learning gaps with clear root causes.

### Structure

```js
Weakness {
  userId,
  topicId,
  rootCause,
  severity,
  evidence,
  relatedTopics,
  spaced
}
```

### Root Causes

| Type            | Meaning                    |
| --------------- | -------------------------- |
| lowAccuracy     | Frequent incorrect answers |
| slowSpeed       | Time taken too high        |
| inconsistency   | Performance fluctuates     |
| prerequisiteGap | Weak prerequisite topics   |

### Severity Levels

* critical
* high
* medium

### Evidence

Based on recent attempts (minimum 3).

---

## 🔁 ReviewSchedule Schema

Manages spaced repetition for topics.

### Structure

```js
ReviewSchedule {
  userId,
  topicId,
  reviews,
  nextReviewAt,
  status
}
```

### Review History

Each review stores:

* accuracy
* interval (days)
* ease factor
* streak

Inspired by the SM-2 spaced repetition algorithm.

---

## 💬 Feedback Schema

Stores rule-based explanations generated after submissions.

### Structure

```js
Feedback {
  userId,
  submissionId,
  rulesFired
}
```

Each rule includes:

* explanation of the issue
* severity
* actionable suggestion

---

## 🔄 Data Flow

```text
Submission
   ↓
User Topic Update
   ↓
Weakness Detection
   ↓
Feedback Generation
   ↓
Review Scheduling
```

---

## 🚀 Why This Schema Works

* Fully explainable
* ML-ready without dependency on ML
* Clean separation of concerns
* Supports analytics dashboards and recommendations

---

## 🧩 Summary

PrepLens does not just identify weak topics.
It identifies **why** the weakness exists and **what to do next**.

This schema forms the foundation for intelligent, mentor-like interview preparation analytics.

```

---

If you want next:
- **ER diagram**
- **API contract README**
- **Interview explanation version**
- **Pitch deck version**

Just bol.
```
