export interface Stage {
  id: string;
  num: string;
  threshold: number;
  label: string;
  sublabel: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
}

export interface ViewpointAngle {
  id: string;
  name: string;
  label: string;
  azimuth: number; // degrees
  elevation: number; // meters
  fov: number;
  pos: [number, number, number];
  target: [number, number, number];
  description: string;
}

export interface ArchitecturalSpace {
  id: string;
  name: string;
  subtitle: string;
  area: string;
  level: string;
  description: string;
  features: string[];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface ExplodedLayer {
  id: string;
  num: string;
  title: string;
  system: string;
  offsetY: number;
  description: string;
  materials: string[];
}

export interface MaterialSpec {
  name: string;
  category: string;
  finish: string;
  description: string;
  origin: string;
  hex: string;
}

export interface Service {
  id: string;
  number: string;
  name: string;
  discipline: string;
  description: string;
  deliverables: string[];
  focus: string;
}

export interface Project {
  id: string;
  n: string;
  loc: string;
  type: string;
  area: string;
  year: string;
  d: string;
  scope: string[];
  det: string;
  specs: { key: string; val: string }[];
}

export interface ContactInfo {
  [key: string]: string;
}

export interface SiteContent {
  brand: {
    name: string;
    tagline: string;
    subtagline: string;
    coordinates: string;
    elevation: string;
    scale: string;
  };
  stages: Stage[];
  viewpoints: ViewpointAngle[];
  spaces: ArchitecturalSpace[];
  explodedLayers: ExplodedLayer[];
  materials: MaterialSpec[];
  services: Service[];
  projects: Project[];
  contact: ContactInfo;
  whatsappNumber: string;
}

export const content: SiteContent = {
  brand: {
    name: 'M & M CONSTRUCTIONS',
    tagline: 'FROM FOUNDATION TO FINISH.',
    subtagline: 'MODERN SPACES FOR A BETTER TOMORROW',
    coordinates: "09°58'12.4\"N 76°17'34.8\"E",
    elevation: 'EL +12.40m AOD',
    scale: '1:100 ARCHITECTURAL MODEL',
  },

  stages: [
    {
      id: 'site',
      num: '01',
      threshold: 0.0,
      label: 'SITE PREPARATION',
      sublabel: 'EARTHWORK & TOPOGRAPHY',
      tagline: 'Grounded in precision from the first boundary demarcation.',
      description: 'Demarcation, topsoil stripping, geological core boring, and precise laser-guided excavation to establish subterranean bearing strata.',
      specs: [
        { label: 'Bearing Capacity', value: '280 kN/m²' },
        { label: 'Excavation Depth', value: '-2.40m BGL' },
        { label: 'Survey Grid', value: '1.20m Laser Datum' },
      ],
    },
    {
      id: 'foundation',
      num: '02',
      threshold: 0.1,
      label: 'FOUNDATION',
      sublabel: 'FOOTINGS & SUBSTRUCTURE',
      tagline: 'Engineered subterranean bedrock integration.',
      description: 'Reinforced cement concrete isolated footings, interconnected grade beams, and heavy-gauge damp-proof membrane with integral capillary barriers.',
      specs: [
        { label: 'Concrete Grade', value: 'M35 High Performance' },
        { label: 'Rebar Specification', value: 'Fe 550D TMT CRS' },
        { label: 'Slab Thickness', value: '250mm Raft Base' },
      ],
    },
    {
      id: 'columns',
      num: '03',
      threshold: 0.2,
      label: 'COLUMNS & BEAMS',
      sublabel: 'PRIMARY STRUCTURAL FRAME',
      tagline: 'Slender vertical RCC members and monolithic transfer spans.',
      description: 'Cast-in-place reinforced concrete column grid and post-tensioned primary transfer beams calibrated for expansive column-free double-height spaces.',
      specs: [
        { label: 'Column Section', value: '300 × 600mm RCC' },
        { label: 'Max Cantilever', value: '4.80m Unsupported' },
        { label: 'Frame Rigidity', value: 'Seismic Zone III Compliant' },
      ],
    },
    {
      id: 'slabs',
      num: '04',
      threshold: 0.35,
      label: 'FLOOR SLABS',
      sublabel: 'HORIZONTAL DIAPHRAGMS',
      tagline: 'Two-way post-tensioned horizontal slabs framing spatial volume.',
      description: 'Monolithic floor diaphragms with recessed MEP conduit channels, integrated thermal insulation cores, and flush perimeter ceiling transitions.',
      specs: [
        { label: 'Floor System', value: 'Post-Tensioned Flat Slab' },
        { label: 'Floor-to-Ceiling', value: '3.60m Clear Height' },
        { label: 'Deflection Index', value: 'L / 480 Controlled' },
      ],
    },
    {
      id: 'walls',
      num: '05',
      threshold: 0.5,
      label: 'WALLS & PARTITIONS',
      sublabel: 'INTERNAL SPATIAL ENVELOPE',
      tagline: 'Thermal masonry partitions and acoustic separation cores.',
      description: 'Aerated autoclaved blockwork, acoustic sound-dampened partitions, double-height foyer shear walls, and feature cantilevered floating staircase.',
      specs: [
        { label: 'Acoustic Rating', value: 'Rw 52 dB Isolation' },
        { label: 'Thermal U-Value', value: '0.34 W/m²K' },
        { label: 'Internal Finish', value: 'Honed Lime Plaster' },
      ],
    },
    {
      id: 'roof',
      num: '06',
      threshold: 0.6,
      label: 'ROOF & FACADE',
      sublabel: 'CANTILEVERED CANOPY & STONE',
      tagline: 'Dramatic floating roof planes and natural stone masonry cladding.',
      description: 'Sculptural cantilevered concrete roof slabs, dark basalt stone feature pylons, insulated rooftop waterproofing deck, and stormwater collection channels.',
      specs: [
        { label: 'Roof Overhang', value: '3.20m Solar Shading' },
        { label: 'Cladding Stone', value: 'Charcoal Basalt Ashlar' },
        { label: 'Waterproofing', value: 'Dual-Layer Elastomeric' },
      ],
    },
    {
      id: 'envelope',
      num: '07',
      threshold: 0.7,
      label: 'WINDOWS & DOORS',
      sublabel: 'THERMAL ENVELOPE & GLAZING',
      tagline: 'Floor-to-ceiling high-transmission acoustic thermal glazing.',
      description: 'Thermally-broken anodized aluminum curtain wall assemblies, oversized pivot entrance portal, motorized sliding panels, and concealed subframe tracks.',
      specs: [
        { label: 'Glazing Type', value: 'Low-E Double Laminated 28mm' },
        { label: 'Visible Light', value: '68% High Transmission' },
        { label: 'Solar Heat Gain', value: 'SHGC 0.28 Climate-Tuned' },
      ],
    },
    {
      id: 'interior',
      num: '08',
      threshold: 0.78,
      label: 'INTERIOR & FURNITURE',
      sublabel: 'BESPOKE FINISHES & LIGHTING',
      tagline: 'Architectural teak louvers, custom millwork, and warm 2700K illumination.',
      description: 'Vertical teak wood acoustic fins, natural Italian marble flooring, concealed cove LED lighting, custom kitchen island bar, and tailored spatial joinery.',
      specs: [
        { label: 'Timber Species', value: 'Sustainably Harvested Teak' },
        { label: 'Color Temperature', value: '2700K Warm Architectural' },
        { label: 'Flooring Surface', value: 'Honed Crema & Grey Basalt' },
      ],
    },
    {
      id: 'landscape',
      num: '09',
      threshold: 0.86,
      label: 'LANDSCAPING',
      sublabel: 'TROPICAL SURROUND & DRIVEWAY',
      tagline: 'Lush tropical foliage, permeable granite driveway, and water reflections.',
      description: 'Specimen tropical palms, cascading terrace planters, illuminated granite paver driveway, illuminated perimeter boundary walls, and exterior floodlighting.',
      specs: [
        { label: 'Plant Palette', value: 'Native Tropical & Specimen Palms' },
        { label: 'Driveway Surface', value: 'Honed Flamed Granite Pavers' },
        { label: 'Exterior Lighting', value: 'IP67 Low-Glare Warm LED' },
      ],
    },
    {
      id: 'complete',
      num: '10',
      threshold: 0.94,
      label: 'COMPLETE RESIDENCE',
      sublabel: 'ARCHITECTURAL MASTERY',
      tagline: 'From Foundation to Finish — A seamless contemporary residence.',
      description: 'The completed modern residence realized as a singular architectural statement uniting engineering rigor, natural materiality, and tropical luxury.',
      specs: [
        { label: 'Total Built Area', value: '6,850 Sq. Ft.' },
        { label: 'Total Volume', value: '2,480 m³ Enclosed' },
        { label: 'Execution Standard', value: 'Zero-Tolerance Turnkey' },
      ],
    },
  ],

  viewpoints: [
    {
      id: 'front',
      name: 'FRONT VIEW',
      label: 'Direct Front Elevation',
      azimuth: 0,
      elevation: 3.5,
      fov: 38,
      pos: [0, 3.5, 24],
      target: [0, 3.2, 0],
      description: 'Symmetrical frontal vantage emphasizing the cantilevered concrete canopy, double-height glass portal, and entrance steps.',
    },
    {
      id: 'frontLeft',
      name: 'FRONT LEFT',
      label: 'Hero Dusk 3/4 Perspective',
      azimuth: -42,
      elevation: 6.5,
      fov: 42,
      pos: [-18, 7.5, 20],
      target: [0, 3.0, 0],
      description: 'Signature architectural hero shot capturing the illuminated driveway, cantilevered terrace, and warm teak louver screen.',
    },
    {
      id: 'frontRight',
      name: 'FRONT RIGHT',
      label: 'Carport & Canopy Perspective',
      azimuth: 45,
      elevation: 6.0,
      fov: 40,
      pos: [19, 6.8, 18],
      target: [1, 3.0, 0],
      description: 'Angular perspective highlighting the cantilevered carport canopy, natural stone ashlar walls, and upper roof terrace.',
    },
    {
      id: 'rear',
      name: 'REAR VIEW',
      label: 'Private Courtyard Elevation',
      azimuth: 180,
      elevation: 4.5,
      fov: 40,
      pos: [0, 4.5, -24],
      target: [0, 3.0, 0],
      description: 'Private rear elevation showcasing continuous sliding glass bays connecting internal living areas to private landscaped courtyards.',
    },
    {
      id: 'left',
      name: 'LEFT VIEW',
      label: 'West Lateral Elevation',
      azimuth: -90,
      elevation: 5.0,
      fov: 38,
      pos: [-24, 5.0, 0],
      target: [0, 3.0, 0],
      description: 'Side architectural profile revealing cantilevered floor projections, vertical circulation stairwell, and thermal shading fins.',
    },
    {
      id: 'right',
      name: 'RIGHT VIEW',
      label: 'East Lateral Profile',
      azimuth: 90,
      elevation: 5.0,
      fov: 38,
      pos: [24, 5.0, 0],
      target: [0, 3.0, 0],
      description: 'Monolithic stone cladding profile with illuminated branding signage wall and integrated service access.',
    },
    {
      id: 'top',
      name: 'TOP VIEW (ROOF)',
      label: 'Axonometric Site Masterplan',
      azimuth: 0,
      elevation: 32.0,
      fov: 32,
      pos: [0, 34, 4],
      target: [0, 0, 0],
      description: 'Overhead masterplan view illustrating setback boundaries, solar terrace deck, lightwell courtyards, and perimeter foliage.',
    },
  ],

  spaces: [
    {
      id: 'living',
      name: 'LIVING AREA',
      subtitle: 'DOUBLE-HEIGHT ATRIUM',
      area: '840 Sq. Ft.',
      level: 'Ground Floor',
      description: 'Soaring 7.2-meter double-height volume wrapped in seamless glass curtains, anchored by a sculptural steel-and-wood floating stair and illuminated by warm recessed architectural linear fixtures.',
      features: ['7.2m Clear Ceiling Height', 'Custom Italian Modular Sectional', 'Integrated Architectural Staircase', 'Concealed 2700K Linear Cove'],
      cameraPos: [-2.5, 2.4, 4.2],
      cameraTarget: [1.2, 2.8, -1.5],
    },
    {
      id: 'kitchen',
      name: 'KITCHEN & DINING',
      subtitle: 'CULINARY SUITE & CELLAR',
      area: '620 Sq. Ft.',
      level: 'Ground Floor',
      description: 'Seamless open-concept entertaining kitchen featuring a monolithic honed charcoal quartz island, matte black cabinetry, integrated climate-controlled wine cellar, and direct terrace sliding access.',
      features: ['Honed Basalt Waterfall Island', 'Flush Integrated Appliances', '10-Seat Solid Teak Dining Table', 'Direct Alfresco Terrace Flow'],
      cameraPos: [4.5, 2.2, 2.8],
      cameraTarget: [-0.5, 2.0, -1.0],
    },
    {
      id: 'bedroom',
      name: 'MASTER SUITE',
      subtitle: 'PRIVATE HAVEN',
      area: '540 Sq. Ft.',
      level: 'Upper Floor',
      description: 'Serene master suite featuring acoustic wood-ribbed feature headboard wall, wide-plank oak flooring, walk-in dressing wardrobe, and corner glass doors opening onto the private cantilevered terrace.',
      features: ['Acoustic Teak Slat Wall', 'Private Sunset Terrace Access', 'Concealed Walk-In Wardrobe', 'Motorized Thermal Blackout Drapes'],
      cameraPos: [-3.8, 5.8, 2.2],
      cameraTarget: [0.5, 5.6, -1.8],
    },
    {
      id: 'bathroom',
      name: 'SPA BATH SUITE',
      subtitle: 'WELLNESS SANCTUARY',
      area: '280 Sq. Ft.',
      level: 'Upper Floor',
      description: 'Honed grey marble wet-room with freestanding stone composite soaking tub, rain-head ceiling shower, frameless fluted glass partitions, and floating twin quartz vanities with backlit mirrors.',
      features: ['Bookmatched Honed Marble', 'Freestanding Soaking Tub', 'Ceiling Rain Shower Matrix', 'Warm Backlit Vanity Mirrors'],
      cameraPos: [3.2, 5.6, -1.5],
      cameraTarget: [0.0, 5.4, 1.2],
    },
    {
      id: 'terrace',
      name: 'CANTILEVERED TERRACE',
      subtitle: 'OUTDOOR LIVING PAVILION',
      area: '480 Sq. Ft.',
      level: 'Upper Floor',
      description: 'Deeply cantilevered outdoor lounge protected by the floating roof overhang, framed by perimeter planter parapets with tropical foliage, and finished in weathered composite teak decking.',
      features: ['4.8m Deep Cantilever Slab', 'Weatherproof Teak Decking', 'Integral Planter Parapets', 'Integrated Recessed Step Lighting'],
      cameraPos: [-4.2, 6.2, 5.5],
      cameraTarget: [1.0, 5.2, 0.5],
    },
    {
      id: 'roofdeck',
      name: 'TOP VIEW (ROOF PLAN)',
      subtitle: 'AXONOMETRIC OVERHEAD',
      area: '3,200 Sq. Ft.',
      level: 'Roof Level',
      description: 'High-albedo reflective roof surface engineered with discrete solar photovoltaic array zones, rainwater retention green roof zones, and concealed HVAC service shafts.',
      features: ['Concealed Parapet Gutters', 'Solar PV Integration Zone', 'Thermal Insulation Barrier', 'Lightwell Atrium Penetration'],
      cameraPos: [0, 28, 6],
      cameraTarget: [0, 4, 0],
    },
  ],

  explodedLayers: [
    {
      id: 'layer-roof',
      num: '07',
      title: 'ROOF & CANOPY SYSTEM',
      system: 'FLOATING OVERHANG & SOLAR DECK',
      offsetY: 7.0,
      description: 'Reinforced concrete cantilevered slabs with multi-layer elastomeric waterproofing membrane, perimeter drainage troughs, and rooftop garden parapets.',
      materials: ['M35 Fair-Faced Concrete', 'High-Albedo Reflective Coating', 'Concealed Copper Flashings'],
    },
    {
      id: 'layer-facade',
      num: '06',
      title: 'FACADE & WOOD FINS',
      system: 'ARCHITECTURAL SCREEN & STONE ASHLAR',
      offsetY: 4.8,
      description: 'Vertical teak wood acoustic louvers for climate-tuned solar shading, dry-clad charcoal basalt feature stone, and precision textured lime render.',
      materials: ['Kiln-Dried Solid Teak Fins', 'Charcoal Basalt Ashlar Stone', 'Textured Mineral Render'],
    },
    {
      id: 'layer-envelope',
      num: '05',
      title: 'ENVELOPE & GLAZING',
      system: 'CURTAIN WALL & SLIDING APERTURES',
      offsetY: 3.4,
      description: 'Double-laminated Low-E acoustic glazing set in thermally-isolated matte black aluminum profiles with flush subfloor drainage tracks.',
      materials: ['28mm Low-E Insulated Glass', 'Anodized Architectural Aluminum', 'EPDM Weather Seals'],
    },
    {
      id: 'layer-walls',
      num: '04',
      title: 'WALLS & PARTITIONS',
      system: 'INTERNAL SPATIAL GEOMETRY & STAIR',
      offsetY: 2.0,
      description: 'Aerated concrete masonry blocks, acoustic sound-isolation drywall framing, and structural steel cantilevered floating staircase spine.',
      materials: ['Autoclaved Aerated Concrete', 'Steel Box Stringer Staircase', 'Honed Lime Micro-Topping'],
    },
    {
      id: 'layer-slabs',
      num: '03',
      title: 'FLOOR SLAB SYSTEM',
      system: 'POST-TENSIONED DIAPHRAGMS',
      offsetY: 0.8,
      description: 'Two-way post-tensioned RCC floor slabs containing cast-in-place conduit matrices, acoustic impact underlayments, and polished marble finishes.',
      materials: ['Post-Tensioned Steel Tendons', 'High-Early-Strength Concrete', 'Acoustic Subfloor Mat'],
    },
    {
      id: 'layer-structure',
      num: '02',
      title: 'STRUCTURAL FRAME',
      system: 'COLUMNS, BEAMS & CANTILEVERS',
      offsetY: 0.0,
      description: 'Seismic-resistant reinforced concrete moment-resisting frame with high-yield Fe550D rebar and ductile column-beam joint reinforcement.',
      materials: ['Fe 550D Corrosion-Resistant Rebar', 'Cast-In-Place RCC Columns', 'Heavy Monolithic Transfer Beams'],
    },
    {
      id: 'layer-foundation',
      num: '01',
      title: 'FOUNDATION & SITE',
      system: 'SUBTERRANEAN STRATA & LANDSCAPE',
      offsetY: -2.5,
      description: 'Isolated reinforced footings, continuous plinth tie beams, damp-proofing barriers, subterranean utility conduits, and permeable granite grounds.',
      materials: ['Waterproofed Foundation Footings', 'High-Density Plinth Insulation', 'Granite Paver Driveway'],
    },
  ],

  materials: [
    {
      name: 'Exposed Fair-Faced Concrete',
      category: 'Structure & Cantilevers',
      finish: 'Matte Formwork Textured',
      description: 'Architectural-grade grey Portland cement cast in smooth timber shuttering with calibrated chamfered joints.',
      origin: 'Custom On-Site Batching',
      hex: '#8e9196',
    },
    {
      name: 'Natural Teak Wood Louvers',
      category: 'Facade & Interior Joinery',
      finish: 'Matte UV-Protective Natural Oil',
      description: 'Kiln-dried plantation teak milled into vertical aerodynamic louvers providing privacy and solar shading.',
      origin: 'Kerala Plantation Timber',
      hex: '#b87b44',
    },
    {
      name: 'Charcoal Basalt Stone Cladding',
      category: 'Feature Monoliths',
      finish: 'Honed & Flamed Split-Face',
      description: 'Volcanic basalt stone cut in precision ashlar blocks to form grounding anchor pylons and illuminated entrance monoliths.',
      origin: 'Deccan Traps Quarry',
      hex: '#2c2d30',
    },
    {
      name: 'Low-E Thermal Acoustic Glazing',
      category: 'Curtain Wall Envelope',
      finish: 'Anti-Reflective Neutral Coating',
      description: 'Double-glazed units with argon gas cavity and solar control nanocoating for maximum clarity and climate efficiency.',
      origin: 'High-Performance Float Glass',
      hex: '#4a5b68',
    },
  ],

  services: [
    {
      id: 'svc-turnkey',
      number: '01',
      name: 'Turnkey Residential Construction',
      discipline: 'General Contracting',
      description: 'End-to-end execution of bespoke luxury residences from ground excavation and structural engineering to final millwork and handover.',
      deliverables: ['RCC Frame & Superstructure', 'High-Tolerance Masonry', 'MEP Infrastructure & Automation', 'Turnkey Handover with Warranties'],
      focus: 'Zero-Tolerance Precision',
    },
    {
      id: 'svc-commercial',
      number: '02',
      name: 'Commercial & Institutional Structures',
      discipline: 'Commercial Building',
      description: 'Engineered commercial facilities, boutique offices, and retail spaces built with speed, structural integrity, and architectural refinement.',
      deliverables: ['Heavy Structural Steel & RCC', 'Curtain Wall Facades', 'Fire & Life Safety Systems', 'Value Engineering Audits'],
      focus: 'Structural Longevity',
    },
    {
      id: 'svc-remodeling',
      number: '03',
      name: 'Architectural Restoration & Renovation',
      discipline: 'Structural Retrofit',
      description: 'Complex structural modifications, spatial reconfiguration, and deep modernization of existing structures with zero compromise on safety.',
      deliverables: ['Structural Reinforcement & Underpinning', 'Spatial Demolition & Reconfiguration', 'Facade Renewal', 'Heritage Material Integration'],
      focus: 'Surgical Transformation',
    },
    {
      id: 'svc-interior',
      number: '04',
      name: 'Interior Architecture & Finishing',
      discipline: 'Bespoke Fitout',
      description: 'Tailored interior fitouts comprising bespoke joinery, acoustic louvering, custom stone masonry, and integrated architectural lighting.',
      deliverables: ['Custom Teak & Oak Millwork', 'Honed Stone & Marble Masonry', '2700K Architectural Lighting Schemes', 'Concealed HVAC Integration'],
      focus: 'Tactile Perfection',
    },
    {
      id: 'svc-management',
      number: '05',
      name: 'Project Management & Engineering',
      discipline: 'Construction Oversight',
      description: 'Comprehensive project management, site supervision, quality control auditing, material testing, and transparent schedule tracking.',
      deliverables: ['BIM Coordination & Clash Detection', 'Milestone-Driven Cost Schedules', 'Daily Quality Assurance Auditing', 'Regulatory Compliance & Approvals'],
      focus: 'Absolute Transparency',
    },
  ],

  projects: [
    {
      id: 'proj-1',
      n: 'The Signature Residence',
      loc: 'Kochi, Kerala',
      type: 'Contemporary Luxury Villa',
      area: '6,850 Sq. Ft.',
      year: '2025',
      d: 'A benchmark tropical-modern residence defined by dramatic cantilevered concrete slabs, vertical teak fins, double-height glass volumes, and integrated landscaped terraces.',
      scope: ['Turnkey Construction', 'RCC Structural Frame', 'Custom Facade Louvers', 'Interior Millwork & MEP'],
      det: 'Cast-in-place concrete with bespoke teak shuttering, Fe550D rebar, Low-E thermal envelope, and smart climate control.',
      specs: [
        { key: 'Footprint', val: '32m × 22m Site Plot' },
        { key: 'Levels', val: 'Ground + First + Roof Deck' },
        { key: 'Structure', val: 'Monolithic Post-Tensioned RCC' },
      ],
    },
    {
      id: 'proj-2',
      n: 'Basalt & Glass Pavilion',
      loc: 'Calicut, Kerala',
      type: 'Residential Architecture',
      area: '5,200 Sq. Ft.',
      year: '2024',
      d: 'A minimalist waterfront residence showcasing dark basalt pylons, floating staircase geometry, and panoramic floor-to-ceiling glass envelopes overlooking lush water gardens.',
      scope: ['Structural Engineering', 'Dry-Clad Stone Facade', 'Curtain Wall Installation', 'Landscape Terraces'],
      det: 'Reinforced seismic frame with deep rock anchoring, basalt ashlar masonry, and insulated low-iron glass facades.',
      specs: [
        { key: 'Footprint', val: '28m × 18m Waterfront Plot' },
        { key: 'Levels', val: '2 Storeys + Infinity Pool Deck' },
        { key: 'Structure', val: 'High-Strength Concrete & Steel Hybrid' },
      ],
    },
    {
      id: 'proj-3',
      n: 'The Courtyard Villa',
      loc: 'Trivandrum, Kerala',
      type: 'Modern Tropical Estate',
      area: '7,400 Sq. Ft.',
      year: '2024',
      d: 'An expansive estate organized around an internal central lightwell courtyard with native tropical trees, cantilevered verandas, and natural lime-plastered thermal envelopes.',
      scope: ['Turnkey Construction', 'Courtyard Engineering', 'Bespoke Joinery', 'Exterior Pavements'],
      det: 'Thermal mass AAC blockwork with ventilated timber cladding, rainwater harvesting cisterns, and rooftop solar array.',
      specs: [
        { key: 'Footprint', val: '40m × 26m Estate Site' },
        { key: 'Levels', val: 'Split-Level Multi-Tier Volume' },
        { key: 'Structure', val: 'Seismic RCC Column-Beam System' },
      ],
    },
  ],

  contact: {
    Studio: 'M & M CONSTRUCTIONS',
    Discipline: 'Architectural Engineering & Turnkey Construction',
    Tagline: 'From Foundation to Finish',
    Consultation: 'By Architectural Appointment',
    Inquiries: 'Direct Studio Desk',
    Phone: '+91 (Studio Inquiries Available Upon Request)',
    Email: 'contact@mmconstructions.com',
    Location: 'Kerala, India',
    WorkingHours: 'Mon — Sat: 09:00 — 18:00 IST',
  },
  whatsappNumber: '+919999999999',
};
