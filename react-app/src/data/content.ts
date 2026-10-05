import { SiteContent } from '../types';

export const SITE_CONTENT: SiteContent = {
  brand: {
    name: 'M & M CONSTRUCTIONS',
    shortName: 'M & M',
    tagline: 'ARCHITECTURE · CRAFT · DETAIL',
    subtagline: 'FROM FOUNDATION TO FINISH',
    discipline: 'Architectural Engineering & Luxury Residential Construction',
    coordinates: '09°58\'12.4"N 76°17\'34.8"E',
    elevation: 'EL +12.40m AOD',
    status: 'STUDIO ACTIVE · BESPOKE RESIDENTIAL'
  },

  cinematic: {
    totalFrames: 960,
    fps: 24,
    resolution: '2560 × 1440',
    aspectRatio: 16 / 9,
    frameBaseUrl: '/frames',
    stages: [
      {
        id: 'stage-01',
        step: '01 / 05',
        title: 'EXTERIOR',
        subtitle: 'APPROACH',
        frameStart: 1,
        frameEnd: 200,
        description: 'Monolithic concrete cantilevers, teak louvers, and lush tropical arrival.'
      },
      {
        id: 'stage-02',
        step: '02 / 05',
        title: 'THRESHOLD',
        subtitle: 'ENTRY',
        frameStart: 201,
        frameEnd: 400,
        description: 'Transition through the architectural portal into double-height volume.'
      },
      {
        id: 'stage-03',
        step: '03 / 05',
        title: 'INTERIOR',
        subtitle: 'VOLUME',
        frameStart: 401,
        frameEnd: 600,
        description: 'Double-height living pavilion, sculptural floating stair, and continuous glass.'
      },
      {
        id: 'stage-04',
        step: '04 / 05',
        title: 'TERRACE',
        subtitle: 'LANDSCAPE',
        frameStart: 601,
        frameEnd: 800,
        description: 'Deep cantilevered upper lounge overlooking cascading tropical greenery.'
      },
      {
        id: 'stage-05',
        step: '05 / 05',
        title: 'SIGNATURE',
        subtitle: 'RESIDENCE',
        frameStart: 801,
        frameEnd: 960,
        description: 'The completed contemporary Kerala residence realized in full architectural balance.'
      }
    ]
  },

  about: {
    badge: 'ABOUT THE STUDIO',
    headline: 'Engineering Architectural Statements That Endure.',
    lead: 'M & M Constructions is a premier residential construction and architectural execution practice. We operate at the convergence of structural precision, master craftsmanship, and uncompromising attention to detail.',
    paragraphs: [
      'Every residence we build is approached as a singular work of architecture. We bridge the gap between ambitious design concepts and flawless physical reality—translating complex structural geometries into timeless, tactile living spaces.',
      'From laser-guided subterranean foundations to post-tensioned cantilevered slabs and custom-milled Kerala teak woodwork, our execution is governed by rigorous quality standards and transparent milestone tracking.'
    ],
    pillars: [
      {
        number: '01',
        title: 'Structural Rigor',
        subtitle: 'Engineering Precision',
        description: 'Post-tensioned RCC frames, high-yield Fe550D rebar, and seismic-tuned monolithic transfer beams designed for zero structural deflection.'
      },
      {
        number: '02',
        title: 'Architectural Craft',
        subtitle: 'Material Fidelity',
        description: 'Honest expression of authentic materials: fair-faced architectural concrete, sustainably sourced Kerala teak, and honed basalt ashlar stonework.'
      },
      {
        number: '03',
        title: 'Climate Responsive',
        subtitle: 'Tropical Modernism',
        description: 'Deep cantilevered solar shading, natural cross-ventilation courtyards, and Low-E thermal envelopes calibrated for tropical climates.'
      },
      {
        number: '04',
        title: 'Turnkey Reliability',
        subtitle: 'Total Accountability',
        description: 'Single-source responsibility from soil testing and excavation to MEP automation, bespoke millwork, and final turnkey commissioning.'
      }
    ]
  },

  services: [
    {
      number: '01',
      id: 'residential-construction',
      title: 'Residential Construction',
      tagline: 'Turnkey Luxury Residences & Modern Villas',
      description: 'Comprehensive general contracting for bespoke architectural homes. We manage end-to-end execution with uncompromising structural integrity, premium material batching, and flawless finish delivery.',
      deliverables: [
        'Turnkey General Contracting',
        'Seismic-Compliant RCC Superstructures',
        'Advanced MEP & Smart Home Automation',
        'Acoustic & Thermal Envelope Isolation'
      ],
      focus: 'End-to-End Build Delivery'
    },
    {
      number: '02',
      id: 'architectural-execution',
      title: 'Architectural Execution',
      tagline: 'Design-Intent Realization & Complex Geometry',
      description: 'Specialized construction management dedicated to bringing complex architectural blueprints to life. We work hand-in-hand with leading architects to execute ambitious cantilevers, double-height volumes, and seamless glass facades.',
      deliverables: [
        'Complex Cantilever & Span Engineering',
        'Curtain Wall & Oversized Portal Installation',
        'Fair-Faced Exposed Concrete Finishes',
        'Architectural Detailing & Mockup Auditing'
      ],
      focus: 'Zero-Tolerance Fidelity'
    },
    {
      number: '03',
      id: 'renovation',
      title: 'Renovation & Retrofitting',
      tagline: 'Structural Modernization & Spatial Reconfiguration',
      description: 'Surgical remodeling and structural retrofit of premium properties. We preserve the soul and structural viability of existing spaces while upgrading MEP infrastructure and modernizing architectural envelopes.',
      deliverables: [
        'Structural Underpinning & Reinforcement',
        'Interior Spatial Demolition & Expansion',
        'Modern Facade Resurfacing & Stone Cladding',
        'Heritage Material Restoration & Blending'
      ],
      focus: 'Surgical Structural Renewal'
    },
    {
      number: '04',
      id: 'interior-execution',
      title: 'Interior Execution',
      tagline: 'Bespoke Millwork, Joinery & Architectural Finishes',
      description: 'Master-level interior fitout and architectural millwork. We fabricate and install custom vertical teak louvers, bookmatched Italian marble masonry, floating stairs, and integrated 2700K warm lighting systems.',
      deliverables: [
        'Custom Plantation Teak Joinery & Louvers',
        'Bookmatched Marble & Honed Basalt Surfaces',
        'Concealed Architectural Linear Lighting',
        'Bespoke Steel & Wood Floating Staircases'
      ],
      focus: 'Tactile Craftsmanship'
    },
    {
      number: '05',
      id: 'structural-civil',
      title: 'Structural / Civil Works',
      tagline: 'Deep Foundations & Monolithic RCC Systems',
      description: 'Heavy civil and structural engineering execution. From laser-aligned excavation, isolated footings, and plinth tie beams to post-tensioned floor diaphragms and long-reach cantilever slabs.',
      deliverables: [
        'Soil Boring & Subterranean Piling',
        'Laser-Guided Foundation Footings & Rafts',
        'Post-Tensioned Flat Slab Diaphragms',
        'High-Performance M35/M40 Batching'
      ],
      focus: 'Subterranean Foundation to Roof'
    },
    {
      number: '06',
      id: 'project-management',
      title: 'Project Management',
      tagline: 'BIM Coordination, QA/QC & Schedule Control',
      description: 'Transparent, client-aligned project oversight. We deploy 3D clash detection, rigorous daily quality assurance testing, milestone cost tracking, and streamlined procurement schedules.',
      deliverables: [
        '3D BIM Clash Detection & Coordination',
        'Milestone Cost & Schedule Governance',
        'Daily Quality Control & Slump Testing',
        'Regulatory Approvals & Statutory Compliance'
      ],
      focus: 'Absolute Transparency'
    }
  ],

  projects: [
    {
      id: 'proj-signature',
      number: '01',
      title: 'The Signature Residence',
      category: 'Contemporary Tropical Villa',
      location: 'Kochi, Kerala',
      area: '6,850 Sq. Ft.',
      year: '2025',
      status: 'Completed',
      overview: 'A benchmark tropical-modern residence featuring dramatic cantilevered concrete slabs, vertical teak fins, double-height glass volumes, and integrated landscaped terraces.',
      scope: ['Turnkey Construction', 'RCC Structural Frame', 'Custom Facade Louvers', 'Interior Millwork & MEP'],
      highlights: [
        '4.8m unsupported cantilevered living terrace',
        'Cast-in-place concrete with bespoke teak shuttering',
        '7.2m clear double-height living atrium',
        'Integrated rainwater harvesting and solar deck'
      ],
      specs: [
        { label: 'Built Area', value: '6,850 Sq. Ft.' },
        { label: 'Plot Extent', value: '32m × 22m' },
        { label: 'Structure', value: 'Post-Tensioned RCC' },
        { label: 'Timeline', value: '18 Months Turnkey' }
      ]
    },
    {
      id: 'proj-basalt',
      number: '02',
      title: 'Basalt & Glass Pavilion',
      category: 'Minimalist Waterfront Residence',
      location: 'Calicut, Kerala',
      area: '5,200 Sq. Ft.',
      year: '2024',
      status: 'Completed',
      overview: 'A minimalist waterfront residence showcasing dark basalt pylons, floating staircase geometry, and panoramic floor-to-ceiling glass envelopes overlooking lush water gardens.',
      scope: ['Structural Engineering', 'Dry-Clad Basalt Facade', 'Curtain Wall Installation', 'Landscape Terraces'],
      highlights: [
        'Dry-clad flamed basalt ashlar stone pylons',
        'Thermally-broken Low-E aluminum curtain glazing',
        'Structural steel cantilevered floating staircase',
        'Perimeter infinity water reflection pond'
      ],
      specs: [
        { label: 'Built Area', value: '5,200 Sq. Ft.' },
        { label: 'Plot Extent', value: '28m × 18m' },
        { label: 'Structure', value: 'Hybrid Steel & RCC' },
        { label: 'Timeline', value: '14 Months Turnkey' }
      ]
    },
    {
      id: 'proj-courtyard',
      number: '03',
      title: 'The Courtyard Villa',
      category: 'Modern Tropical Estate',
      location: 'Trivandrum, Kerala',
      area: '7,400 Sq. Ft.',
      year: '2024',
      status: 'Completed',
      overview: 'An expansive modern estate organized around an internal central lightwell courtyard with native tropical trees, cantilevered verandas, and natural lime-plastered thermal envelopes.',
      scope: ['Turnkey Construction', 'Courtyard Engineering', 'Bespoke Joinery', 'Exterior Granite Paving'],
      highlights: [
        'Central open-to-sky courtyard with internal drainage',
        'Breathable lime micro-plaster wall finishes',
        'Full-perimeter flamed granite paver driveway',
        'Bespoke kiln-dried solid teak door assemblies'
      ],
      specs: [
        { label: 'Built Area', value: '7,400 Sq. Ft.' },
        { label: 'Plot Extent', value: '40m × 26m' },
        { label: 'Structure', value: 'Seismic RCC Column-Beam' },
        { label: 'Timeline', value: '20 Months Turnkey' }
      ]
    },
    {
      id: 'proj-hillside',
      number: '04',
      title: 'Hillside Cantilever House',
      category: 'Terraced Concrete Residence',
      location: 'Wayanad, Kerala',
      area: '4,900 Sq. Ft.',
      year: '2023',
      status: 'Completed',
      overview: 'A stepped residential structure hugging a steep topography, engineered with deep rock anchors, board-formed concrete retaining walls, and panoramic forest vista decks.',
      scope: ['Topographical Excavation', 'Rock Anchoring & Retaining', 'RCC Cantilevered Decks', 'Interior Fitout'],
      highlights: [
        'Engineered stepped retaining walls with micro-piles',
        'Board-formed architectural concrete finish',
        'Cantilevered panoramic viewing deck over ravine',
        'Passive hillside cooling and thermal insulation'
      ],
      specs: [
        { label: 'Built Area', value: '4,900 Sq. Ft.' },
        { label: 'Plot Extent', value: 'Sloped 35° Terrain' },
        { label: 'Structure', value: 'Rock-Anchored RCC Frame' },
        { label: 'Timeline', value: '16 Months Turnkey' }
      ]
    }
  ],

  process: [
    {
      step: '01',
      title: 'VISION',
      subtitle: 'Architectural Brief & Site Analysis',
      description: 'Demarcation, topographical survey, geological soil core testing, and solar trajectory mapping to establish project parameters and baseline constraints.',
      deliverables: ['Geotechnical Core Report', 'Topographical Laser Survey', 'Site Logistics Masterplan']
    },
    {
      step: '02',
      title: 'PLANNING',
      subtitle: 'Engineering & 3D Coordination',
      description: 'Structural calculations, 3D BIM clash detection, structural drawing signoffs, material batching protocols, and detailed milestone schedule formulation.',
      deliverables: ['3D BIM Clash Matrix', 'Structural RCC Schedules', 'Material Batching Specifications']
    },
    {
      step: '03',
      title: 'FOUNDATION',
      subtitle: 'Subterranean Execution',
      description: 'Laser-guided excavation, isolated reinforced concrete footings, continuous plinth tie beams, damp-proofing barriers, and subterranean utility conduits.',
      deliverables: ['M35 High-Performance Footings', 'Dual Damp-Proof Membrane', 'Laser Plinth Alignment']
    },
    {
      step: '04',
      title: 'STRUCTURE',
      subtitle: 'RCC Frame & Cantilevers',
      description: 'Precision shuttering, Fe550D rebar placement, slender column casting, post-tensioned floor diaphragms, and sculptural cantilevered canopy slabs.',
      deliverables: ['Post-Tensioned Slabs', 'Slender Concrete Columns', 'Unsupported Cantilever Spans']
    },
    {
      step: '05',
      title: 'ARCHITECTURE',
      subtitle: 'Envelope & Facade Systems',
      description: 'Thermal AAC blockwork, Low-E thermal double-laminated curtain wall glazing, dry-clad basalt stone ashlar, and solid teak vertical louver screens.',
      deliverables: ['Low-E Thermal Glazing', 'Basalt Ashlar Masonry', 'Aerodynamic Teak Louvers']
    },
    {
      step: '06',
      title: 'DETAIL',
      subtitle: 'Millwork & Tactile Finishes',
      description: 'Bespoke plantation teak joinery, honed marble flooring, custom steel floating staircase, concealed 2700K cove lighting, and acoustic drywalling.',
      deliverables: ['Custom Teak Millwork', 'Honed Stone Masonry', '2700K Architectural Lighting']
    },
    {
      step: '07',
      title: 'COMPLETION',
      subtitle: 'Commissioning & Handover',
      description: 'Acoustic testing, MEP load testing, thermal imaging envelope audits, immaculate site finishing, client orientation, and comprehensive warranty handover.',
      deliverables: ['Full System Commissioning', 'Thermal & Acoustic Audit Reports', 'Turnkey Warranty Package']
    }
  ],

  contact: {
    badge: 'COMMENCE A CONVERSATION',
    headline: 'Let us build your architectural vision.',
    lead: 'We accept a limited number of bespoke residential and architectural commissions each year to ensure rigorous director-level oversight on every site.',
    details: {
      phone: '+91 7012495244',
      phones: ['+91 7012495244', '+91 7510838992'],
      email: 'maneshjohn932@gmail.com',
      location: 'Manthuka, Kulanada',
      hours: 'Mon – Sat: 09:00 – 18:00 IST'
    },
    note: 'Consultations available by appointment. Inquiries strictly confidential.'
  },

  footer: {
    brand: 'M & M CONSTRUCTIONS',
    tagline: 'FROM FOUNDATION TO FINISH.',
    copyright: '© 2026 M & M Constructions. All rights reserved.',
    disclaimer: 'Architectural portfolio & construction execution practice.'
  }
};
