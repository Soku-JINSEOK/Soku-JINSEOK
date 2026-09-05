<!-- markdownlint-disable MD013 MD033 MD041 -->

<p align="center">
  <img src="assets/banner.svg" alt="JINSEOK SEOK — Software, Cloud &amp; Automation" width="100%">
</p>

<div align="center">
  <a href="https://github.com/Soku-JINSEOK">
    <img src="https://github.com/Soku-JINSEOK.png?size=180" width="120" alt="Profile photo of JINSEOK SEOK">
  </a>

  <h1>JINSEOK SEOK</h1>

  <p><strong>Software &amp; DX Engineer</strong><br>Cloud · Automation · Data · Web</p>

  <p>
    I turn operational needs into maintainable software,<br>
    developer workflows, and safe automation.
  </p>

  <p>
    🇰🇷 <b>Korean</b> — Native &nbsp;•&nbsp; 🇯🇵 <b>Japanese</b> — Daily Work &nbsp;•&nbsp; 🌐 <b>English</b> — Technical Documentation
  </p>

  <p>
    <a href="#-featured-engineering-work"><b>Featured Work</b></a> &nbsp;•&nbsp;
    <a href="#-engineering-experience"><b>Experience</b></a> &nbsp;•&nbsp;
    <a href="https://github.com/Soku-JINSEOK?tab=repositories"><b>Repositories</b></a> &nbsp;•&nbsp;
    <a href="https://github.com/Soku-JINSEOK"><b>GitHub</b></a>
  </p>
</div>

<!-- markdownlint-enable MD013 MD033 MD041 -->

---

## 👨‍💻 About

I am a software and DX engineer based in Japan. My engineering work bridges business operations and engineering: translating operational requirements into maintainable software, cloud systems, and developer automation that remain robust long after initial release.

<!-- markdownlint-disable MD033 -->
<details>
<summary><b>🇰🇷 한국어 / 🇯🇵 日本語 요약 (Click to expand)</b></summary>
<br>

> **🇰🇷 한국어**: 한국 출신으로 일본에서 근무하는 소프트웨어 및 DX 엔지니어입니다. 비즈니스 요구사항을 유지보수 가능한 소프트웨어, 클라우드 시스템, 개발 자동화로 구현하며 맥락과 근거가 남는 엔지니어링 소통을 지향합니다.
>
> **🇯🇵 日本語**: 日本を拠点に活動するソフトウェアおよびDXエンジニアです。業務要件を保守性の高いソフトウェア、クラウドシステム、開発自動化へと落とし込み、持続可能な開発ワークフローを構築します。

</details>
<!-- markdownlint-enable MD033 -->

---

## 🚀 Featured Engineering Work

### 🧩 [Flagship] Soku Ecosystem
> **Repository Lifecycle & CI/CD Governance Framework**

An engineering initiative designed to make repository conventions, lifecycle management, and CI/CD governance explicit, reviewable, and automated.

```mermaid
flowchart TB
    Ops["Operational Requirements"]
    Boilerplate["Soku-Convention-Boilerplate<br/>Public Convention & Lifecycle Entrypoint"]
    ControlPlane["ci-cd-control-plane<br/>Central Governance & Pipeline Contracts"]
    Repos["Target Product Repositories"]

    Ops --> Boilerplate
    Boilerplate --> ControlPlane
    ControlPlane --> Repos
```

* **[Soku-Convention-Boilerplate](https://github.com/Soku-JINSEOK/Soku-Convention-Boilerplate)** `[Public]`
  * **Role & Architecture:** Public convention entry point owning the lifecycle, manifest schema, managed-file ownership model, and generic provider boundary.
  * **Tech Stack:** `TypeScript` `GitHub Actions` `Shell`
* **`ci-cd-control-plane`** `[Private · Selected details]`
  * **Role & Architecture:** Central governance repository defining versioned pipeline contracts and declarative CI/CD provider boundaries.
  * **Tech Stack:** `Go` `Cloud Architecture` `Declarative Pipelines`

---

### 🛠️ Selected Projects

These private projects remain under validation; the summaries describe their scope, not deployment readiness.
한국어: 아래 비공개 프로젝트는 검증 중이며, 소개는 배포 완료를 의미하지 않습니다.
日本語: 以下の非公開プロジェクトは検証中です。紹介はデプロイ完了を示すものではありません。

### 🎬 CutVi `[Private · Selected details]`
> **Desktop Media Packaging & Processing Tool**
>
> * **Objective:** Privacy-first, local-first media packaging without cloud uploads.
> * **Engineering Highlights:** Secure local processing via Electron desktop wrapper with native FFmpeg streaming pipelines.
> * **Tech Stack:** `TypeScript` `React` `Electron` `FFmpeg`

### 🏗️ Archviz `[Private · Selected details]`
> **Declarative Architecture Modeling & Load System**
>
> * **Objective:** Declarative architecture visualization and simulated load-scenario verification.
> * **Engineering Highlights:** Parses declarative YAML system models into visual topologies with simulated throughput verification.
> * **Tech Stack:** `Go` `React` `YAML`

### 📚 report-hub `[Private · Selected details]`
> **Personal Research & Report Blog MVP**
>
> * **Objective:** Browse and author research notes and reports using a personal Google account.
> * **Engineering Highlights:** Apps Script web app with Google Sheets post data and Docs/Drive content integration; private-environment validation is ongoing.
> * **Tech Stack:** `JavaScript` `Google Apps Script` `Google Sheets`

### 🌏 SOKU-PR-site `[Private · Selected details]`
> **Multilingual Cloud Portfolio Platform Prototype**
>
> * **Objective:** Type-safe multilingual portfolio platform with decoupled cloud backend.
> * **Engineering Highlights:** Multilingual rendering and a locally validated backend prototype; identity, persistence, and private-runtime verification remain in progress.
> * **Tech Stack:** `Angular` `Go` `GCP`

---

## 💻 Engineering Experience

<!-- markdownlint-disable MD013 MD033 -->

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Go-00ADD8?style=flat-square&amp;logo=go&amp;logoColor=white" alt="Go">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&amp;logo=python&amp;logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&amp;logo=javascript&amp;logoColor=black" alt="JavaScript">
</p>

<!-- markdownlint-enable MD013 MD033 -->

* **Practical & Professional Experience:** Business workflow automation, cloud systems (Google Cloud, Google Workspace / Apps Script), operational software.
* **Project Engineering:** Web and desktop applications (React, Angular, Electron), declarative data modeling, media processing pipelines.
* **Current Engineering Focus:** Repository conventions, CI/CD governance, lifecycle tooling (Soku ecosystem).
* **Languages used across work and projects:** TypeScript, Go, Python, JavaScript.

---

## 🧭 How I Work

Engineering quality is defined by predictable delivery, testable code, and transparent collaboration:

* **Issue-first:** Every task begins with clear intent, scope definition, and explicit acceptance criteria before implementation.
* **Contract-first:** Interfaces, API schemas, and data structures are formally defined to ensure decoupled, testable components.
* **Verification-centered:** Code changes are backed by automated tests, type validation, and concrete execution evidence.
* **Explicit approval:** Production releases, schema migrations, and security-sensitive configurations require deliberate human sign-off.

> **AI-Assisted Development:** AI-assisted workflows adhere to the same review, linting, and testing standards as human-authored code.

---

## 📍 Explore My Work

* **Public work:** Browse [public repositories](https://github.com/Soku-JINSEOK?tab=repositories) for the available source and documentation.
* **Location:** Japan 🇯🇵

---

<!-- markdownlint-disable MD033 -->

<p align="center">
  <sub>Readable conventions · Safe automation · Verifiable delivery</sub>
</p>

<!-- markdownlint-enable MD033 -->
