export type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  specs: string;
  priceCents: number;
  comparePriceCents?: number;
  category: string;
  imageUrl: string;
  badge?: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isQuoteOnly?: boolean;
};

export const CATEGORIES = ["Tout", "Salons de jardin", "Fauteuils", "Tables", "Décoration", "Structures"];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "salon-atlas-anthracite",
    name: "Salon de jardin ATLAS",
    shortDescription: "4 pièces · acier thermolaqué noir · coussins gris déperlants",
    description:
      "Le salon ATLAS est notre pièce signature : un canapé 3 places, deux fauteuils et une table basse à lames, assemblés en tube acier 40×40 mm soudé puis thermolaqué noir mat. Les coussins 12 cm d'épaisseur sont garnis de mousse haute résilience et habillés d'un tissu outdoor déperlant anti-UV. Pensé pour les terrasses, patios et rooftops qui ne veulent pas de plastique.",
    specs:
      "Canapé 3 places 220×80×70 cm · 2 fauteuils 85×80×70 cm · Table basse 120×70×38 cm · Acier 40×40 mm · Thermolaquage noir mat RAL 9005 · Tissu outdoor anti-UV déperlant",
    priceCents: 189000,
    comparePriceCents: 229000,
    category: "Salons de jardin",
    imageUrl: "/images/salon-atlas.jpg",
    badge: "Best-seller",
    stock: 12,
    rating: 4.9,
    reviewsCount: 87,
    isFeatured: true,
  },
  {
    slug: "fauteuil-onyx",
    name: "Fauteuil lounge ONYX",
    shortDescription: "Structure fil d'acier noir · coussin matelassé intégral",
    description:
      "Une ligne graphique réduite à l'essentiel : un cadre en tube acier fin soudé à la main, et un épais coussin matelassé capitonné qui flotte dans la structure. L'ONYX est à la fois une sculpture et le fauteuil le plus confortable de l'atelier. Idéal en intérieur, véranda ou terrasse couverte.",
    specs:
      "Dimensions 78×85×80 cm · Hauteur d'assise 38 cm · Tube acier 25×25 mm · Soudures meulées invisibles · Thermolaquage noir mat · Coussin capitonné mousse HR 100 kg/m³ · Housse déhoussable",
    priceCents: 39000,
    category: "Fauteuils",
    imageUrl: "/images/fauteuil-onyx.jpg",
    badge: "Signature",
    stock: 24,
    rating: 4.9,
    reviewsCount: 134,
    isFeatured: true,
  },
  {
    slug: "salon-ivoire-5-pieces",
    name: "Salon IVOIRE 5 pièces",
    shortDescription: "Canapé + 2 fauteuils + pouf + table marbre · blanc crème",
    description:
      "L'ensemble IVOIRE joue le contraste entre une ossature acier noir ultra-fine et des assises crème généreuses. Livré avec un pouf modulable et une table basse plateau marbre véritable sur piètement acier. Le set qui transforme un bord de piscine en salon d'hôtel.",
    specs:
      "Canapé 3 places 230×85 cm · 2 fauteuils 90×85 cm · Pouf 100×55 cm · Table basse marbre 120×70 cm · Acier 30×30 mm noir mat · Déperlant, mousse à séchage rapide · Montage inclus en région",
    priceCents: 249000,
    comparePriceCents: 289000,
    category: "Salons de jardin",
    imageUrl: "/images/salon-ivoire.jpg",
    badge: "Premium",
    stock: 7,
    rating: 5.0,
    reviewsCount: 52,
    isFeatured: true,
  },
  {
    slug: "salon-graphite-4-pieces",
    name: "Salon GRAPHITE 4 pièces",
    shortDescription: "Canapé 2 places + 2 fauteuils + table à lames · gris anthracite",
    description:
      "Format compact pensé pour les terrasses urbaines et balcons généreux. Ossature aluminium/acier anthracite, coussins gris chinés épais, table basse à lames qui évacue l'eau de pluie. Se décline en toutes teintes RAL sur demande sans supplément.",
    specs:
      "Canapé 2 places 150×78 cm · 2 fauteuils 80×78 cm · Table 110×60×38 cm · Finition anthracite RAL 7016 · Lames pleines · Coussins déperlants 10 cm · Toute teinte RAL sur demande",
    priceCents: 169000,
    category: "Salons de jardin",
    imageUrl: "/images/salon-graphite.jpg",
    stock: 15,
    rating: 4.8,
    reviewsCount: 76,
    isFeatured: false,
  },
  {
    slug: "fauteuil-lina-toile",
    name: "Fauteuil LINA toile tendue",
    shortDescription: "Cadre acier géométrique · toile coton écru tendue",
    description:
      "Un exercice de style : deux cadres acier décalés qui portent une toile coton écru tendue en suspension. Léger (7,8 kg), empilable par deux, le LINA se déplace d'une pièce à l'autre d'une seule main. Toile remplaçable, disponible en écru, noir ou terracotta.",
    specs:
      "Dimensions 70×80×75 cm · Poids 7,8 kg · Tube acier plein 20 mm · Toile coton 420 g/m² lavable · 3 coloris de toile · Patins feutre inclus",
    priceCents: 34000,
    category: "Fauteuils",
    imageUrl: "/images/fauteuil-lina.jpg",
    badge: "Nouveau",
    stock: 30,
    rating: 4.7,
    reviewsCount: 61,
    isFeatured: true,
  },
  {
    slug: "table-basse-axis",
    name: "Table basse AXIS verre",
    shortDescription: "Plateau verre trempé 10 mm · piètement acier croisé",
    description:
      "Le piètement en X croisé de la table AXIS crée une perspective différente sous chaque angle. Plateau en verre trempé 10 mm à bords polis, posé sur silentblocs invisibles. Existe en version bout de canapé assortie (65×65 cm).",
    specs:
      "Plateau 120×60 cm verre trempé 10 mm · Hauteur 42 cm · Piètement acier plat 40×10 mm · Thermolaquage noir satiné · Bout de canapé assorti disponible · Charge admissible 80 kg",
    priceCents: 45000,
    category: "Tables",
    imageUrl: "/images/table-axis.jpg",
    stock: 19,
    rating: 4.8,
    reviewsCount: 44,
    isFeatured: false,
  },
  {
    slug: "sellette-totem",
    name: "Sellette TOTEM porte-plante",
    shortDescription: "Colonne acier noir 2 plateaux · 100 cm",
    description:
      "La sellette TOTEM élève vos plantes à hauteur de regard. Structure en tube acier carré soudé, deux plateaux (haut et intermédiaire) pour composer. Disponible en 70, 100 et 130 cm. Le cadeau d'ouverture préféré de nos clients.",
    specs:
      "Hauteur 100 cm · Plateaux 25×25 cm · Tube acier 20×20 mm · Noir mat ou blanc · Patins antidérapants · Charge 25 kg · Autres hauteurs : 70 et 130 cm",
    priceCents: 12000,
    comparePriceCents: 15000,
    category: "Décoration",
    imageUrl: "/images/sellette-totem.jpg",
    badge: "Promo",
    stock: 48,
    rating: 4.9,
    reviewsCount: 118,
    isFeatured: false,
  },
  {
    slug: "canape-angle-horizon",
    name: "Canapé d'angle HORIZON",
    shortDescription: "Modulable 5 places · structure blanche · coussins gris",
    description:
      "Un angle modulable que vous recomposez à volonté : méridienne à gauche ou à droite, modules additionnels disponibles à l'unité. Structure acier thermolaqué blanc, assises profondes de 85 cm pour s'y allonger vraiment. Fabriqué sur mesure selon les dimensions de votre terrasse.",
    specs:
      "Configuration 290×190 cm (modulable) · Profondeur d'assise 85 cm · Acier 50×30 mm blanc RAL 9010 · Coussins gris chiné déperlants 14 cm · Modules additionnels à l'unité · Dimensions sur mesure possibles",
    priceCents: 219000,
    category: "Salons de jardin",
    imageUrl: "/images/canape-horizon.jpg",
    badge: "Sur mesure",
    stock: 6,
    rating: 4.9,
    reviewsCount: 39,
    isFeatured: true,
  },
  {
    slug: "abri-carport-metallique",
    name: "Abri / Carport métallique",
    shortDescription: "Structure acier + couverture polycarbonate · sur mesure",
    description:
      "Carports 1 à 4 véhicules, préaux, auvents de terrasse et abris techniques. Étude de charges neige et vent incluse, platines chevillées ou scellées selon votre dalle. Couverture au choix : polycarbonate alvéolaire, bac acier ou tôle imitation tuile. Pose par nos équipes partout en région.",
    specs:
      "Portée jusqu'à 7 m sans poteau intermédiaire · Acier S235 galvanisé puis thermolaqué · Couverture polycarbonate 16 mm, bac acier ou tuile · Étude neige/vent Eurocode incluse · Pose et garantie décennale · Délai 4 à 6 semaines",
    priceCents: 0,
    category: "Structures",
    imageUrl: "/images/abri-carport.jpg",
    badge: "Sur devis",
    stock: 99,
    rating: 5.0,
    reviewsCount: 23,
    isFeatured: false,
    isQuoteOnly: true,
  },
  {
    slug: "charpente-metallique",
    name: "Charpente métallique",
    shortDescription: "Hangars, mezzanines, ossatures · étude & pose",
    description:
      "Notre cœur de métier industriel : charpentes de hangars agricoles, bâtiments d'activité, mezzanines de stockage, ossatures secondaires et passerelles. Bureau d'études intégré, notes de calcul, plans d'exécution, fabrication en atelier et montage sur site par nos monteurs certifiés.",
    specs:
      "Portiques, fermes treillis, mezzanines, passerelles · Acier S235/S355 · Soudage professionnel contrôlé · Notes de calcul et plans d'exécution fournis · Galvanisation à chaud ou thermolaquage · Montage et levage inclus",
    priceCents: 0,
    category: "Structures",
    imageUrl: "/images/charpente-metallique.jpg",
    badge: "Sur devis",
    stock: 99,
    rating: 5.0,
    reviewsCount: 31,
    isFeatured: false,
    isQuoteOnly: true,
  },
];

export const SEED_REVIEWS: Record<string, { author: string; rating: number; title: string; comment: string }[]> = {
  "salon-atlas-anthracite": [
    { author: "Karim B.", rating: 5, title: "Du vrai métal, pas du toc", comment: "Les soudures sont parfaitement meulées, le thermolaquage est impeccable. Après un hiver dehors, zéro trace de rouille. Rien à voir avec le mobilier de grande surface." },
    { author: "Sandrine M.", rating: 5, title: "Livré et monté en 3 semaines", comment: "Équipe très pro, ils ont monté le salon sur ma terrasse en une matinée. Les coussins sèchent très vite après la pluie, c'est bluffant." },
    { author: "Thomas L.", rating: 4, title: "Superbe, prévoyez de l'aide", comment: "Qualité au rendez-vous et design magnifique. C'est lourd (donc stable !) mais prévoyez deux personnes si vous déplacez souvent." },
  ],
  "fauteuil-onyx": [
    { author: "Nadia F.", rating: 5, title: "Une sculpture confortable", comment: "Tout le monde me demande où je l'ai acheté. Le coussin est bien plus confortable que ce que laisse penser la photo." },
    { author: "Pierre-Alain D.", rating: 5, title: "Finition irréprochable", comment: "Je suis moi-même métallier, je peux dire que le travail de soudure est de haut niveau. Chapeau à l'atelier." },
  ],
  "abri-carport-metallique": [
    { author: "SCI Les Cèdres", rating: 5, title: "Carport 3 voitures livré dans les temps", comment: "Étude sérieuse, notes de calcul fournies pour le permis, pose nickel. Le polycarbonate laisse passer la lumière, la cour reste claire." },
  ],
  "charpente-metallique": [
    { author: "Groupe Valbat", rating: 5, title: "Partenaire charpente fiable", comment: "Troisième hangar réalisé avec Nexus Metal. Plans d'exécution propres, soudures certifiées, montage sans reprise. On continue." },
  ],
};
