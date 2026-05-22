// Run with: npx tsx server/seed.ts
import { db } from "./db";
import { certificationBodies, categories, replacementGuides } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding certification bodies...");

  await db.insert(certificationBodies).values([
    {
      name: "Soil Association Organic",
      slug: "soil-association-organic",
      country: "GB",
      category: "organic",
      verificationUrl: "https://www.soilassociation.org/certification/",
      logoUrl: null,
    },
    {
      name: "Fairtrade Foundation",
      slug: "fairtrade-foundation",
      country: "GB",
      category: "fairtrade",
      verificationUrl: "https://www.fairtrade.org.uk/",
      logoUrl: null,
    },
    {
      name: "B Corp",
      slug: "b-corp",
      country: null,
      category: "bcorp",
      verificationUrl: "https://www.bcorporation.net/",
      logoUrl: null,
    },
    {
      name: "PETA Vegan",
      slug: "peta-vegan",
      country: "US",
      category: "vegan",
      verificationUrl: "https://www.peta.org/living/personal-care-fashion/beauty-without-bunnies/",
      logoUrl: null,
    },
    {
      name: "Leaping Bunny (Cruelty Free International)",
      slug: "leaping-bunny",
      country: "GB",
      category: "cruelty_free",
      verificationUrl: "https://www.crueltyfreeinternational.org/leaping-bunny-program",
      logoUrl: null,
    },
    {
      name: "FSC (Forest Stewardship Council)",
      slug: "fsc",
      country: null,
      category: "environmental",
      verificationUrl: "https://fsc.org/en",
      logoUrl: null,
    },
    {
      name: "COSMOS Organic",
      slug: "cosmos-organic",
      country: null,
      category: "organic",
      verificationUrl: "https://cosmosstandard.org/",
      logoUrl: null,
    },
    {
      name: "Rainforest Alliance",
      slug: "rainforest-alliance",
      country: null,
      category: "environmental",
      verificationUrl: "https://www.rainforest-alliance.org/",
      logoUrl: null,
    },
    {
      name: "1% for the Planet",
      slug: "one-percent-planet",
      country: "US",
      category: "environmental",
      verificationUrl: "https://www.onepercentfortheplanet.org/",
      logoUrl: null,
    },
    {
      name: "EU Ecolabel",
      slug: "eu-ecolabel",
      country: null,
      category: "environmental",
      verificationUrl: "https://ec.europa.eu/ecat/",
      logoUrl: null,
    },
    {
      name: "Zero Waste Certified",
      slug: "zero-waste-certified",
      country: "US",
      category: "plasticfree",
      verificationUrl: "https://true.gbci.org/",
      logoUrl: null,
    },
    {
      name: "Plastic Free Trust Mark",
      slug: "plastic-free-trust",
      country: "GB",
      category: "plasticfree",
      verificationUrl: "https://www.aplasticplanet.com/trust-mark",
      logoUrl: null,
    },
  ]).onConflictDoNothing();

  console.log("Seeding zero-waste categories...");

  // Top-level categories
  await db.insert(categories).values([
    { name: "Kitchen & Food Storage", slug: "kitchen-food-storage", description: "Zero-waste alternatives for your kitchen and pantry", parentSlug: null },
    { name: "Bathroom & Personal Care", slug: "bathroom-personal-care", description: "Plastic-free personal care products", parentSlug: null },
    { name: "Cleaning & Laundry", slug: "cleaning-laundry", description: "Eco-friendly cleaning products and refills", parentSlug: null },
    { name: "Home Textiles & Living", slug: "home-textiles-living", description: "Natural fibre textiles and sustainable home goods", parentSlug: null },
  ]).onConflictDoNothing();

  // Sub-categories
  await db.insert(categories).values([
    { name: "Reusable Wraps & Covers", slug: "reusable-wraps-covers", description: "Beeswax wraps, silicone covers, fabric bowl covers", parentSlug: "kitchen-food-storage" },
    { name: "Compostable Bags & Liners", slug: "compostable-bags", description: "Home-compostable bags for food and waste", parentSlug: "kitchen-food-storage" },
    { name: "Reusable Bottles & Containers", slug: "reusable-bottles-containers", description: "Stainless steel, glass and silicone storage", parentSlug: "kitchen-food-storage" },
    { name: "Package-Free Pantry", slug: "package-free-pantry", description: "Refillable and bulk pantry staples", parentSlug: "kitchen-food-storage" },
    { name: "Shampoo & Conditioner Bars", slug: "shampoo-conditioner-bars", description: "Plastic-free hair care bars", parentSlug: "bathroom-personal-care" },
    { name: "Plastic-Free Oral Care", slug: "oral-care", description: "Bamboo toothbrushes, tooth tabs, compostable floss", parentSlug: "bathroom-personal-care" },
    { name: "Natural Skincare & Soap", slug: "natural-skincare-soap", description: "Bar soaps, solid moisturisers, natural skincare", parentSlug: "bathroom-personal-care" },
    { name: "Reusable Personal Care", slug: "reusable-personal-care", description: "Reusable cotton pads, safety razors, period care", parentSlug: "bathroom-personal-care" },
    { name: "Concentrated Cleaners", slug: "concentrated-cleaners", description: "Refillable and concentrated cleaning products", parentSlug: "cleaning-laundry" },
    { name: "Natural Scrubbers & Cloths", slug: "scrubbers-cloths", description: "Compostable sponges, natural fibre cloths", parentSlug: "cleaning-laundry" },
    { name: "Plastic-Free Laundry", slug: "plastic-free-laundry", description: "Laundry sheets, soap nuts, eco detergents", parentSlug: "cleaning-laundry" },
    { name: "Natural Fibre Textiles", slug: "natural-textiles", description: "Organic cotton, linen and hemp home textiles", parentSlug: "home-textiles-living" },
    { name: "Eco Stationery & Gifting", slug: "eco-stationery-gifting", description: "Sustainable stationery and zero-waste gifts", parentSlug: "home-textiles-living" },
  ]).onConflictDoNothing();

  console.log("Seeding replacement guides...");

  await db.insert(replacementGuides).values([
    { conventionalItem: "Cling film / plastic wrap", slug: "cling-film", headline: "Ditch cling film for good", categorySlug: "reusable-wraps-covers", filterOverrides: { packagingType: "plastic_free" }, seoDescription: "The best certified zero-waste alternatives to cling film — beeswax wraps, silicone covers and reusable fabric bowl covers.", conventionalCarbonKgPerYear: "2.4" },
    { conventionalItem: "Plastic toothbrush", slug: "plastic-toothbrush", headline: "Switch to a plastic-free toothbrush", categorySlug: "oral-care", filterOverrides: { packagingType: "plastic_free" }, seoDescription: "Certified bamboo toothbrushes and compostable alternatives to plastic toothbrushes — verified by GreenMart.", conventionalCarbonKgPerYear: "0.8" },
    { conventionalItem: "Liquid shampoo in plastic bottle", slug: "liquid-shampoo", headline: "Go plastic-free with shampoo bars", categorySlug: "shampoo-conditioner-bars", filterOverrides: {}, seoDescription: "Certified zero-waste shampoo bars and conditioner bars as alternatives to single-use plastic bottles.", conventionalCarbonKgPerYear: "1.9" },
    { conventionalItem: "Plastic bottle (water)", slug: "plastic-water-bottle", headline: "Replace single-use plastic bottles", categorySlug: "reusable-bottles-containers", filterOverrides: {}, seoDescription: "Reusable stainless steel and glass water bottles — verified alternatives to single-use plastic.", conventionalCarbonKgPerYear: "11.2" },
    { conventionalItem: "Disposable cotton pads", slug: "disposable-cotton-pads", headline: "Switch to reusable cotton pads", categorySlug: "reusable-personal-care", filterOverrides: {}, seoDescription: "Certified reusable cotton rounds and makeup remover pads as alternatives to single-use disposables.", conventionalCarbonKgPerYear: "3.1" },
    { conventionalItem: "Plastic washing-up sponge", slug: "washing-up-sponge", headline: "Replace your plastic sponge", categorySlug: "scrubbers-cloths", filterOverrides: { packagingType: "plastic_free" }, seoDescription: "Compostable loofah, natural fibre and plant-based scrubbers as alternatives to plastic sponges.", conventionalCarbonKgPerYear: "1.4" },
    { conventionalItem: "Liquid hand soap pump", slug: "liquid-hand-soap", headline: "Swap to a hand soap bar", categorySlug: "natural-skincare-soap", filterOverrides: {}, seoDescription: "Zero-waste certified hand soap bars and refillable options as alternatives to single-use plastic pumps.", conventionalCarbonKgPerYear: "2.1" },
    { conventionalItem: "Plastic food bags (zip-lock)", slug: "plastic-food-bags", headline: "Reusable alternatives to zip-lock bags", categorySlug: "reusable-wraps-covers", filterOverrides: {}, seoDescription: "Silicone bags, beeswax pouches and compostable alternatives to single-use plastic zip-lock bags.", conventionalCarbonKgPerYear: "3.8" },
    { conventionalItem: "Synthetic body wash", slug: "synthetic-body-wash", headline: "Switch to a natural solid body wash", categorySlug: "natural-skincare-soap", filterOverrides: {}, seoDescription: "Certified natural and organic solid body wash bars — plastic-free and zero-waste.", conventionalCarbonKgPerYear: "1.7" },
    { conventionalItem: "Plastic liquid laundry detergent", slug: "plastic-laundry-detergent", headline: "Plastic-free laundry alternatives", categorySlug: "plastic-free-laundry", filterOverrides: {}, seoDescription: "Laundry sheets, soap nuts, and refillable laundry products as alternatives to plastic bottles.", conventionalCarbonKgPerYear: "4.9" },
    { conventionalItem: "Disposable razor", slug: "disposable-razor", headline: "Replace disposable razors", categorySlug: "reusable-personal-care", filterOverrides: {}, seoDescription: "Long-lasting safety razors and zero-waste shaving as alternatives to disposable plastic razors.", conventionalCarbonKgPerYear: "2.6" },
    { conventionalItem: "Plastic floss", slug: "plastic-floss", headline: "Switch to compostable floss", categorySlug: "oral-care", filterOverrides: {}, seoDescription: "Silk and plant-based compostable dental floss as an alternative to conventional plastic floss.", conventionalCarbonKgPerYear: "0.3" },
    { conventionalItem: "Paper kitchen roll", slug: "paper-kitchen-roll", headline: "Reusable alternatives to kitchen roll", categorySlug: "scrubbers-cloths", filterOverrides: {}, seoDescription: "Reusable cloth kitchen rolls, Swedish dishcloths and organic cotton towels instead of disposable paper.", conventionalCarbonKgPerYear: "8.4" },
    { conventionalItem: "Plastic cling wrap for leftovers", slug: "leftover-covers", headline: "Leftover covers without plastic", categorySlug: "reusable-wraps-covers", filterOverrides: {}, seoDescription: "Silicone stretch lids and fabric bowl covers to replace cling wrap for leftovers.", conventionalCarbonKgPerYear: "1.8" },
    { conventionalItem: "Single-use cleaning spray", slug: "cleaning-spray", headline: "Refillable cleaning spray alternatives", categorySlug: "concentrated-cleaners", filterOverrides: {}, seoDescription: "Concentrated refill tablets and eco-friendly spray bottles to replace single-use plastic cleaning sprays.", conventionalCarbonKgPerYear: "5.2" },
    { conventionalItem: "Synthetic shower gel", slug: "shower-gel", headline: "Natural shower bar alternatives", categorySlug: "natural-skincare-soap", filterOverrides: {}, seoDescription: "Certified organic and natural shower bars as plastic-free alternatives to synthetic shower gel.", conventionalCarbonKgPerYear: "2.0" },
    { conventionalItem: "Plastic bin liners", slug: "bin-liners", headline: "Compostable bin liner alternatives", categorySlug: "compostable-bags", filterOverrides: {}, seoDescription: "Home-compostable and biodegradable bin liners as alternatives to standard plastic bin bags.", conventionalCarbonKgPerYear: "6.1" },
    { conventionalItem: "Plastic conditioner bottle", slug: "conditioner-bottle", headline: "Switch to conditioner bars", categorySlug: "shampoo-conditioner-bars", filterOverrides: {}, seoDescription: "Certified conditioner bars and zero-waste hair conditioning alternatives to single-use plastic bottles.", conventionalCarbonKgPerYear: "1.5" },
    { conventionalItem: "Standard plastic toothpaste", slug: "toothpaste", headline: "Plastic-free toothpaste alternatives", categorySlug: "oral-care", filterOverrides: {}, seoDescription: "Toothpaste tablets, tooth powder and refillable glass jars as zero-waste alternatives to plastic tubes.", conventionalCarbonKgPerYear: "0.9" },
    { conventionalItem: "Synthetic fabric softener", slug: "fabric-softener", headline: "Natural fabric softener alternatives", categorySlug: "plastic-free-laundry", filterOverrides: {}, seoDescription: "Wool dryer balls, vinegar rinses and natural fabric softener strips as plastic-free alternatives.", conventionalCarbonKgPerYear: "3.3" },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
