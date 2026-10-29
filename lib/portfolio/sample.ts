import { DEFAULT_TEMPLATE_ID } from "./templates"
import type { TemplateId } from "./constants"
import type { PortfolioContent } from "./schemas"
import { templateDesign } from "./templates"

function sampleId(n: number) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
}

export function createSampleContent(
  templateId: TemplateId = DEFAULT_TEMPLATE_ID
): PortfolioContent {
  return {
    version: 2,
    templateId: "studio",
    design: templateDesign(templateId),
    basics: {
      fullName: "Avery Quinn",
      headline: "Product designer & systems thinker",
      location: "Brooklyn, NY",
      email: "hello@averyquinn.design",
      phone: "+1 555 014 2200",
      avatarMediaId: null,
      businessName: "Quinn Studio",
      ownerName: "Avery Quinn",
      role: "Independent product designer",
      tagline: "Calm, useful products for teams who care about the details.",
      whatsapp: "+1 555 014 2200",
      address: "82 Dean Street, Brooklyn, NY",
      heroMediaId: null,
      logoMediaId: null,
    },
    sections: [
      {
        id: sampleId(1),
        type: "hero",
        visible: true,
        imageMediaId: null,
      },
      {
        id: sampleId(2),
        type: "about",
        visible: true,
        title: "A little about me",
        body: "I'm a product designer with eight years of experience across fintech, climate, and civic tech. I like problems that are a little tangled: workflows with too many steps, products with too many owners, teams with too many ideas.\n\nMy work usually starts with listening. Then it becomes maps, prototypes, and eventually a system that a team can build on without me in the room. I care about the quiet parts of an interface — the empty states, the error messages, the moment after the click.\n\nWhen I'm not designing, I'm probably wandering a museum, learning to make pasta, or collecting books about type.",
        highlights: [
          "Eight years across product, brand, and design systems",
          "Comfortable leading research through to shipped UI",
          "Fluent in Figma, code, and cross-functional translation",
        ],
        tag: "A little about us",
        messageTitle: "A personal note",
        message:
          "If you are not sure where to start, that is completely fine. Most good projects begin with an unfinished thought and a short conversation.",
      },
      {
        id: sampleId(3),
        type: "projects",
        visible: true,
        title: "Selected work",
        intro:
          "A few projects that show how I think. Case studies are available on request.",
        items: [
          {
            id: sampleId(101),
            title: "Northwind — a calmer finance cockpit",
            description:
              "Redesigned the daily operating view for a B2B treasury team. Cut the time to reconcile a payment run from 22 minutes to six, with a clearer hierarchy and a system of reusable status patterns.",
            tags: ["Product design", "Design systems", "Fintech"],
            url: "https://example.com/northwind",
            repoUrl: "",
            imageMediaId: null,
            featured: true,
            year: "2026",
          },
          {
            id: sampleId(102),
            title: "Fieldnotes",
            description:
              "A field-research toolkit for a climate nonprofit. Volunteers capture observations offline, then publish them into a shared map that local councils actually use.",
            tags: ["Research", "Mobile", "Climate"],
            url: "https://example.com/fieldnotes",
            repoUrl: "",
            imageMediaId: null,
            featured: false,
            year: "2025",
          },
          {
            id: sampleId(103),
            title: "Loomwork",
            description:
              "Brand and product system for a small studio making software for textile artists. A soft, tactile interface that treats the workbench as the centre of the experience.",
            tags: ["Brand", "Interface", "Craft"],
            url: "https://example.com/loomwork",
            repoUrl: "",
            imageMediaId: null,
            featured: false,
            year: "2025",
          },
          {
            id: sampleId(104),
            title: "Orbit",
            description:
              "An open-source pattern library for scheduling interfaces. Twelve composable components, documented with the decisions behind them.",
            tags: ["Open source", "Components"],
            url: "https://example.com/orbit",
            repoUrl: "https://example.com/orbit-code",
            imageMediaId: null,
            featured: false,
            year: "2024",
          },
        ],
      },
      {
        id: sampleId(4),
        type: "experience",
        visible: true,
        title: "Experience",
        items: [
          {
            id: sampleId(201),
            role: "Independent product designer",
            company: "Studio Quinn",
            location: "Brooklyn, NY",
            startDate: "2023",
            endDate: "",
            current: true,
            description:
              "Partnering with seed to Series B teams on product strategy, interface design, and the systems that hold it together.",
            highlights: [
              "Led a six-month redesign of a treasury platform used by 2,000 finance teams",
              "Built a design system that reduced new-screen build time by roughly 40%",
            ],
          },
          {
            id: sampleId(202),
            role: "Senior product designer",
            company: "Parcel",
            location: "New York, NY",
            startDate: "2020",
            endDate: "2023",
            current: false,
            description:
              "Owned the merchant experience for a logistics platform through a period of rapid growth, from 40 to 180 people.",
            highlights: [
              "Shipped a self-serve onboarding flow that became the default for 70% of new accounts",
              "Started the research practice and ran a monthly customer council",
            ],
          },
          {
            id: sampleId(203),
            role: "Product designer",
            company: "Common Ground",
            location: "Remote",
            startDate: "2018",
            endDate: "2020",
            current: false,
            description:
              "Designed civic tools for local governments, with a focus on accessibility and low-bandwidth contexts.",
            highlights: [],
          },
        ],
      },
      {
        id: sampleId(5),
        type: "skills",
        visible: true,
        title: "What I bring",
        intro: "A mix of craft, systems thinking, and a stubborn curiosity.",
        groups: [
          {
            id: sampleId(301),
            name: "Design",
            items: [
              "Product strategy",
              "Interaction design",
              "Prototyping",
              "Design systems",
              "Brand systems",
            ],
          },
          {
            id: sampleId(302),
            name: "Research",
            items: [
              "Customer interviews",
              "Usability testing",
              "Jobs to be done",
              "Service mapping",
            ],
          },
          {
            id: sampleId(303),
            name: "Build",
            items: ["Figma", "HTML & CSS", "React", "Framer", "Storybook"],
          },
        ],
      },
      {
        id: sampleId(6),
        type: "services",
        visible: true,
        title: "How we can work together",
        intro:
          "I take on a small number of projects at a time. Most engagements run eight to twelve weeks.",
        items: [
          {
            id: sampleId(401),
            title: "Product design partnership",
            description:
              "Embedded design support for a team shipping a new product or a significant redesign. Research, interface, and system, end to end.",
          },
          {
            id: sampleId(402),
            title: "Design system foundations",
            description:
              "A practical system built around how your team actually works: tokens, components, documentation, and a rollout plan.",
          },
          {
            id: sampleId(403),
            title: "Design review & coaching",
            description:
              "A focused review of your current product, with clear recommendations and a working session for your team.",
          },
        ],
        ctaText:
          "Tell us what you are working on. We will reply with a clear plan, a timeline, and the next step.",
        ctaLabel: "Start a conversation",
        ctaUrl: "#section-contact",
      },
      {
        id: sampleId(13),
        type: "mission",
        visible: true,
        title: "Our mission",
        intro: "Three promises we keep on every project.",
        items: [
          {
            id: sampleId(1001),
            title: "Listen first",
            text: "We start with your customers, your constraints, and the outcome you actually need.",
          },
          {
            id: sampleId(1002),
            title: "Make it clear",
            text: "Every decision is explained in plain language. No jargon and no surprises.",
          },
          {
            id: sampleId(1003),
            title: "Leave it stronger",
            text: "You get a system your team can run without us in the room.",
          },
        ],
      },
      {
        id: sampleId(14),
        type: "events",
        visible: true,
        title: "Events & announcements",
        intro: "A few things coming up this season.",
        items: [
          {
            id: sampleId(1101),
            title: "Studio open week",
            theme: "Meet the team",
            text: "A relaxed hour to talk through your project, see recent work, and ask anything.",
            meta: ["12 November", "Brooklyn studio", "Free"],
            list: ["Bring a rough idea", "Tea and pastries", "No pitch deck needed"],
            quote: "The best conversations usually start with a question, not a proposal.",
          },
        ],
      },
      {
        id: sampleId(15),
        type: "products",
        visible: true,
        title: "Products",
        intro: "Small, useful things we make alongside client work.",
        items: [
          {
            id: sampleId(1201),
            title: "Fieldnotes workbook",
            description: "A printed workbook for running calmer customer interviews.",
            price: "$28",
            imageMediaId: null,
            url: "https://example.com/fieldnotes",
          },
          {
            id: sampleId(1202),
            title: "Orbit pattern library",
            description: "Twelve composable scheduling patterns with the decisions behind them.",
            price: "$42",
            imageMediaId: null,
            url: "https://example.com/orbit",
          },
        ],
      },
      {
        id: sampleId(16),
        type: "gallery",
        visible: true,
        title: "Our work",
        intro: "A look at recent projects, spaces, and details.",
        items: [
          {
            id: sampleId(1301),
            title: "Northwind cockpit",
            caption: "A calmer daily view for a treasury team.",
            imageMediaId: null,
          },
          {
            id: sampleId(1302),
            title: "Loomwork studio",
            caption: "A tactile brand and product system.",
            imageMediaId: null,
          },
          {
            id: sampleId(1303),
            title: "Fieldnotes kit",
            caption: "Research tools that work offline.",
            imageMediaId: null,
          },
        ],
      },
      {
        id: sampleId(17),
        type: "videos",
        visible: true,
        title: "Videos",
        intro: "Short walkthroughs and conversations.",
        items: [
          {
            id: sampleId(1401),
            title: "How we start a project",
            youtubeId: "dQw4w9WgXcQ",
          },
        ],
      },
      {
        id: sampleId(18),
        type: "payment",
        visible: true,
        title: "Payments",
        subtitle: "Pay a deposit or a small invoice in a few seconds.",
        heading: "Scan to pay with any UPI app",
        upiId: "quinnstudio@example",
        payeeName: "Quinn Studio",
        qrMediaId: null,
      },
      {
        id: sampleId(19),
        type: "socials",
        visible: true,
        title: "Follow us",
        intro: "New work, notes, and the occasional studio photo.",
        items: [
          {
            id: sampleId(1501),
            platform: "Instagram",
            url: "https://www.instagram.com",
          },
          {
            id: sampleId(1502),
            platform: "Facebook",
            url: "https://www.facebook.com",
          },
          {
            id: sampleId(1503),
            platform: "LinkedIn",
            url: "https://www.linkedin.com",
          },
        ],
      },
      {
        id: sampleId(20),
        type: "qr",
        visible: true,
        title: "Scan and connect",
        intro: "Save our link, WhatsApp, and Instagram with a single scan.",
        whatsappUrl: "https://wa.me/15550142200",
        instagramUrl: "https://www.instagram.com",
      },
      {
        id: sampleId(7),
        type: "testimonials",
        visible: true,
        title: "Kind words",
        items: [
          {
            id: sampleId(501),
            quote:
              "Avery has the rare ability to make a complicated system feel obvious. The work was thoughtful, but the way they brought the team along was the real gift.",
            name: "Mina Patel",
            role: "VP Product",
            company: "Northwind",
            avatarMediaId: null,
          },
          {
            id: sampleId(502),
            quote:
              "We came in with a mess of screens and left with a product we were proud to ship. Calm, rigorous, and genuinely collaborative.",
            name: "Jon Bell",
            role: "Co-founder",
            company: "Fieldnotes",
            avatarMediaId: null,
          },
        ],
      },
      {
        id: sampleId(8),
        type: "education",
        visible: true,
        title: "Education",
        items: [
          {
            id: sampleId(601),
            degree: "BFA, Communication Design",
            institution: "Parsons School of Design",
            location: "New York, NY",
            startDate: "2014",
            endDate: "2018",
            description:
              "Focused on interaction design and typography. Thesis on public information systems.",
          },
        ],
      },
      {
        id: sampleId(9),
        type: "certifications",
        visible: true,
        title: "Certifications",
        items: [
          {
            id: sampleId(701),
            name: "Accessibility Foundations",
            issuer: "Deque University",
            issueDate: "2024",
            credentialUrl: "https://example.com/credential/accessibility",
          },
          {
            id: sampleId(702),
            name: "Facilitation for Design Teams",
            issuer: "Cooper Professional Education",
            issueDate: "2022",
            credentialUrl: "",
          },
        ],
      },
      {
        id: sampleId(10),
        type: "achievements",
        visible: true,
        title: "Milestones",
        items: [
          {
            id: sampleId(801),
            title: "Speaker, Config 2025",
            issuer: "Figma",
            date: "2025",
            description:
              "Talked about designing scheduling systems that respect people's time.",
          },
          {
            id: sampleId(802),
            title: "Awwwards Honourable Mention",
            issuer: "Awwwards",
            date: "2024",
            description: "For the Loomwork studio site and product system.",
          },
        ],
      },
      {
        id: sampleId(11),
        type: "resume",
        visible: true,
        title: "Resume",
        summary:
          "A concise overview of my experience, selected outcomes, and the tools I work with. The full CV is available on request.",
        fileMediaId: null,
        highlights: [
          "8+ years in product design across fintech, climate, and civic tech",
          "Design systems, research, prototyping, and front-end fluency",
          "Experience building and mentoring small design teams",
        ],
      },
      {
        id: sampleId(12),
        type: "contact",
        visible: true,
        title: "Let's make something considered.",
        message:
          "I'm currently booking projects for the next quarter. If you have something tangled and interesting, I'd love to hear about it.",
        email: "",
        phone: "",
        location: "",
        links: [
          {
            id: sampleId(901),
            label: "LinkedIn",
            url: "https://www.linkedin.com",
          },
          {
            id: sampleId(902),
            label: "GitHub",
            url: "https://github.com",
          },
          {
            id: sampleId(903),
            label: "Read.cv",
            url: "https://read.cv",
          },
        ],
        subtitle: "We usually reply within one working day.",
        whatsapp: "",
        address: "",
        formTitle: "Send us a message",
        formNote: "Tell us a little about what you need. We will take it from there.",
      },
    ],
  }
}
