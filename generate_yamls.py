import os
import yaml

rules_dir = r"c:\Users\91886\Desktop\CRO\crox\knowledge\rules"
os.makedirs(rules_dir, exist_ok=True)

rules = [
    {
        "filename": "hero-headline.yaml",
        "content": {
            "id": "hero.headline",
            "version": "1.0.0",
            "description": "Hero headline must be present, convey a clear value prop, and have appropriate length.",
            "checks": [
                {"id": "headline_presence", "type": "code", "rule": "document.querySelectorAll('h1').length > 0", "description": "H1 headline is present", "severity": "high"},
                {"id": "headline_length", "type": "code", "rule": "h1.textContent.length > 10 && h1.textContent.length < 100", "description": "Headline length is optimal", "severity": "medium"},
                {"id": "headline_value_prop", "type": "nlp", "rule": "containsValueProp(h1.text)", "description": "Headline contains value proposition", "severity": "high"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "text_content"],
            "ai_prompt_template": "The hero headline has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "hero-image.yaml",
        "content": {
            "id": "hero.image",
            "version": "1.0.0",
            "description": "Hero image or video must be present, optimized, and have alt text.",
            "checks": [
                {"id": "image_presence", "type": "code", "rule": "document.querySelectorAll('img[data-cro-hero], video[data-cro-hero]').length > 0", "description": "Hero image/video is present", "severity": "high"},
                {"id": "image_alt_text", "type": "code", "rule": "img.alt && img.alt.length > 0", "description": "Hero image has alt text", "severity": "medium"},
                {"id": "image_optimization", "type": "nlp", "rule": "isOptimizedFormat(img.src)", "description": "Hero media is optimized", "severity": "low"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "dom_snippet"],
            "ai_prompt_template": "The hero image has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "navigation.yaml",
        "content": {
            "id": "nav.structure",
            "version": "1.0.0",
            "description": "Navigation must have optimal item count, search, and stickiness.",
            "checks": [
                {"id": "nav_item_count", "type": "code", "rule": "document.querySelectorAll('nav > ul > li').length <= 7", "description": "Max 7 top-level nav items", "severity": "medium"},
                {"id": "nav_search", "type": "code", "rule": "document.querySelectorAll('input[type=\"search\"], [data-cro-search]').length > 0", "description": "Search bar is present", "severity": "medium"},
                {"id": "nav_sticky", "type": "code", "rule": "getComputedStyle(nav).position === 'sticky' || getComputedStyle(nav).position === 'fixed'", "description": "Navigation is sticky", "severity": "low"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "computed_styles"],
            "ai_prompt_template": "The navigation has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "testimonial.yaml",
        "content": {
            "id": "trust.testimonial",
            "version": "1.0.0",
            "description": "Testimonials must have presence, photo, name, and be near CTA.",
            "checks": [
                {"id": "testimonial_presence", "type": "code", "rule": "document.querySelectorAll('[data-cro-testimonial]').length > 0", "description": "Testimonial is present", "severity": "high"},
                {"id": "testimonial_photo", "type": "code", "rule": "testimonial.querySelector('img') !== null", "description": "Testimonial has author photo", "severity": "medium"},
                {"id": "testimonial_near_cta", "type": "nlp", "rule": "isNear(testimonial, cta)", "description": "Testimonial is close to CTA", "severity": "low"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "text_content"],
            "ai_prompt_template": "The testimonials have these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "trust-badges.yaml",
        "content": {
            "id": "trust.badges",
            "version": "1.0.0",
            "description": "Trust badges must be present and near CTA.",
            "checks": [
                {"id": "badges_presence", "type": "code", "rule": "document.querySelectorAll('[data-cro-trust-badge]').length > 0", "description": "Trust badges are present", "severity": "high"},
                {"id": "badges_near_cta", "type": "nlp", "rule": "isNear(badges, cta)", "description": "Trust badges are close to CTA", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The trust badges have these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "footer.yaml",
        "content": {
            "id": "nav.footer",
            "version": "1.0.0",
            "description": "Footer must include contact info, privacy links, and sitemap.",
            "checks": [
                {"id": "footer_contact", "type": "nlp", "rule": "containsContactInfo(footer.text)", "description": "Footer contains contact information", "severity": "high"},
                {"id": "footer_privacy", "type": "code", "rule": "footer.querySelectorAll('a[href*=\"privacy\"]').length > 0", "description": "Privacy policy link is present", "severity": "high"},
                {"id": "footer_sitemap", "type": "code", "rule": "footer.querySelectorAll('ul > li > a').length > 5", "description": "Footer acts as a sitemap", "severity": "low"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "text_content"],
            "ai_prompt_template": "The footer has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "plp-product-card.yaml",
        "content": {
            "id": "plp.product_card",
            "version": "1.0.0",
            "description": "Product cards on PLP must have image, name, price, rating, and ATC.",
            "checks": [
                {"id": "card_image", "type": "code", "rule": "card.querySelector('img') !== null", "description": "Product image is present", "severity": "high"},
                {"id": "card_price", "type": "nlp", "rule": "containsPrice(card.text)", "description": "Product price is visible", "severity": "high"},
                {"id": "card_rating", "type": "code", "rule": "card.querySelector('.rating, [data-cro-rating]') !== null", "description": "Product rating is visible", "severity": "medium"},
                {"id": "card_atc", "type": "code", "rule": "card.querySelector('button') !== null", "description": "Add to Cart button is present", "severity": "high"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "text_content"],
            "ai_prompt_template": "The PLP product card has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "plp-filters.yaml",
        "content": {
            "id": "plp.filters",
            "version": "1.0.0",
            "description": "PLP must have filtering and sorting options.",
            "checks": [
                {"id": "filters_presence", "type": "code", "rule": "document.querySelectorAll('[data-cro-filters]').length > 0", "description": "Filters are present", "severity": "high"},
                {"id": "sort_presence", "type": "code", "rule": "document.querySelectorAll('select[data-cro-sort]').length > 0", "description": "Sorting options are present", "severity": "high"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The PLP filters have these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "plp-pagination.yaml",
        "content": {
            "id": "plp.pagination",
            "version": "1.0.0",
            "description": "PLP must have pagination and display total results count.",
            "checks": [
                {"id": "pagination_presence", "type": "code", "rule": "document.querySelectorAll('[data-cro-pagination]').length > 0", "description": "Pagination is present", "severity": "high"},
                {"id": "results_count", "type": "nlp", "rule": "containsResultsCount(page.text)", "description": "Total results count is visible", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The PLP pagination has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "pdp-add-to-cart.yaml",
        "content": {
            "id": "pdp.add_to_cart",
            "version": "1.0.0",
            "description": "PDP Add to Cart button must have high contrast, size, and urgency.",
            "checks": [
                {"id": "atc_contrast", "type": "code", "rule": "getContrastRatio(button) >= 4.5", "description": "ATC Contrast ratio ≥ 4.5:1", "severity": "high"},
                {"id": "atc_size", "type": "code", "rule": "button.width >= 44 && button.height >= 44", "description": "ATC Touch target ≥44x44px", "severity": "high"},
                {"id": "atc_urgency", "type": "nlp", "rule": "containsUrgency(page.text)", "description": "Urgency cues are present near ATC", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "computed_styles"],
            "ai_prompt_template": "The PDP ATC button has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "pdp-product-images.yaml",
        "content": {
            "id": "pdp.images",
            "version": "1.0.0",
            "description": "PDP must have multiple high-quality images and zoom capability.",
            "checks": [
                {"id": "image_count", "type": "code", "rule": "document.querySelectorAll('.product-gallery img').length >= 3", "description": "At least 3 product images", "severity": "high"},
                {"id": "image_zoom", "type": "nlp", "rule": "hasZoomCapability(gallery)", "description": "Images have zoom capability", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The PDP product images have these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "pdp-product-details.yaml",
        "content": {
            "id": "pdp.details",
            "version": "1.0.0",
            "description": "PDP must include description, specs, shipping, and returns information.",
            "checks": [
                {"id": "details_description", "type": "nlp", "rule": "containsDescription(page.text)", "description": "Product description is present", "severity": "high"},
                {"id": "details_shipping", "type": "nlp", "rule": "containsShippingInfo(page.text)", "description": "Shipping information is visible", "severity": "high"},
                {"id": "details_returns", "type": "nlp", "rule": "containsReturnsInfo(page.text)", "description": "Returns information is visible", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "text_content"],
            "ai_prompt_template": "The PDP details have these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "pdp-cross-sell.yaml",
        "content": {
            "id": "pdp.cross_sell",
            "version": "1.0.0",
            "description": "PDP must contain related products or cross-sells.",
            "checks": [
                {"id": "cross_sell_presence", "type": "code", "rule": "document.querySelectorAll('[data-cro-related-products]').length > 0", "description": "Related products section is present", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The PDP cross-sell section has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "service-homepage-hero.yaml",
        "content": {
            "id": "service_home.hero",
            "version": "1.0.0",
            "description": "Service homepage hero must have headline, CTA, and trust signals.",
            "checks": [
                {"id": "hero_headline", "type": "code", "rule": "document.querySelectorAll('h1').length > 0", "description": "Headline is present", "severity": "high"},
                {"id": "hero_cta", "type": "code", "rule": "document.querySelectorAll('button[data-cro-cta]').length > 0", "description": "CTA is present", "severity": "high"},
                {"id": "hero_trust", "type": "nlp", "rule": "containsTrustSignals(hero.text)", "description": "Trust signals in hero", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "text_content"],
            "ai_prompt_template": "The service homepage hero has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "service-homepage-services-overview.yaml",
        "content": {
            "id": "service_home.overview",
            "version": "1.0.0",
            "description": "Service homepage must list services with links to details.",
            "checks": [
                {"id": "services_list", "type": "code", "rule": "document.querySelectorAll('[data-cro-service-item]').length >= 3", "description": "At least 3 services listed", "severity": "high"},
                {"id": "services_links", "type": "code", "rule": "serviceItem.querySelector('a') !== null", "description": "Services link to details", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The service overview has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "service-detail-page.yaml",
        "content": {
            "id": "service.detail",
            "version": "1.0.0",
            "description": "Service detail page must have description, process, deliverables, and CTA.",
            "checks": [
                {"id": "service_desc", "type": "nlp", "rule": "containsDescription(page.text)", "description": "Service description is present", "severity": "high"},
                {"id": "service_process", "type": "nlp", "rule": "containsProcess(page.text)", "description": "Process is outlined", "severity": "medium"},
                {"id": "service_cta", "type": "code", "rule": "document.querySelectorAll('button[data-cro-cta]').length > 0", "description": "CTA is present", "severity": "high"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "text_content"],
            "ai_prompt_template": "The service detail page has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "contact-form.yaml",
        "content": {
            "id": "lead.contact_form",
            "version": "1.0.0",
            "description": "Contact form must have appropriate fields, privacy checkbox, and submit button.",
            "checks": [
                {"id": "form_fields_count", "type": "code", "rule": "document.querySelectorAll('form input:not([type=\"hidden\"])').length <= 5", "description": "Max 5 visible fields", "severity": "medium"},
                {"id": "privacy_checkbox", "type": "code", "rule": "document.querySelectorAll('input[type=\"checkbox\"][name*=\"privacy\"]').length > 0", "description": "Privacy checkbox is present", "severity": "low"},
                {"id": "submit_button", "type": "code", "rule": "document.querySelectorAll('button[type=\"submit\"]').length > 0", "description": "Submit button is present", "severity": "high"}
            ],
            "required_evidence": ["screenshot", "bounding_box", "dom_snippet"],
            "ai_prompt_template": "The contact form has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "case-studies.yaml",
        "content": {
            "id": "trust.case_studies",
            "version": "1.0.0",
            "description": "Case studies must be present to build trust.",
            "checks": [
                {"id": "case_studies_presence", "type": "code", "rule": "document.querySelectorAll('[data-cro-case-study]').length >= 2", "description": "At least 2 case studies present", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "bounding_box"],
            "ai_prompt_template": "The case studies have these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    },
    {
        "filename": "mobile-responsiveness.yaml",
        "content": {
            "id": "usability.mobile",
            "version": "1.0.0",
            "description": "Page must be mobile responsive with correct viewport meta, touch targets, and readable font sizes.",
            "checks": [
                {"id": "viewport_meta", "type": "code", "rule": "document.querySelector('meta[name=\"viewport\"]') !== null", "description": "Viewport meta tag exists", "severity": "high"},
                {"id": "touch_targets", "type": "code", "rule": "button.width >= 44 && button.height >= 44", "description": "Touch targets are adequately sized", "severity": "high"},
                {"id": "font_size", "type": "code", "rule": "parseFloat(getComputedStyle(p).fontSize) >= 16", "description": "Base font size is at least 16px", "severity": "medium"}
            ],
            "required_evidence": ["screenshot", "computed_styles"],
            "ai_prompt_template": "The mobile responsiveness has these measured issues:\n{{#each failed_checks}}\n- {{description}}: actual {{actual}}\n{{/each}}\nGenerate: title, description, business impact, recommendation."
        }
    }
]

for rule in rules:
    with open(os.path.join(rules_dir, rule["filename"]), "w") as f:
        yaml.dump(rule["content"], f, default_flow_style=False, sort_keys=False)

print("Created all YAML files.")
