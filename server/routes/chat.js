const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Helper to read products for context
function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * POST /api/chat
 * Body: { query }
 * Returns: { success, reply }
 */
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      const products = readProducts();
      const catalogSummary = products.map(p => `- ${p.name} (${p.category}): ₹${p.price}`).join('\n');
      
      const systemInstruction = `You are a helpful, professional AI E-Commerce Shopping Assistant for "SENTARA" (a premium global storefront).
Store Details:
- Store Name: SENTARA
- Policies: 7-day replacement policy on original items.
- Shipping: Standard shipping is FREE on orders above ₹499 (else ₹40). 2-4 business days.
- Loyalty Program: Shopping Score (10 Pts per purchase, 15 Pts per review, 50 Pts per referral. Points can be redeemed at checkout).
- Special Features: 
  * "Shop With Friends" (Group Carts for voting/collaborative shopping)
  * "Smart Budget Builder" (Suggests product bundles under a target budget)
  * "AI Shopping Copilot" (Interactive product finder on homepage)
  * "Mood-Based Shopping" (Recommendations based on mood tabs)
  
Product Catalog Summary:
${catalogSummary}

User Query: "${query}"

Provide a concise, helpful, and premium shopping assistant response. Keep it friendly and short (max 2-3 sentences). Do not hallucinate products not in the catalog above.`;

      try {
        console.log('[Gemini] Generating chat reply...');
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemInstruction
                  }
                ]
              }
            ]
          })
        });

        const data = await apiResponse.json();
        if (apiResponse.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const reply = data.candidates[0].content.parts[0].text.trim();
          return res.status(200).json({ success: true, reply });
        } else {
          console.error('[Gemini Error] API failed:', data);
        }
      } catch (err) {
        console.error('[Gemini Error] Fetch failed:', err);
      }
    }

    // Fallback to static mock replies
    const q = query.toLowerCase();
    let reply = "I'm processing that for you. Let me query our catalog... 🔎";

    if (q.includes('delivery') || q.includes('ship') || q.includes('time') || q.includes('pincode')) {
      reply = "🚚 Standard delivery is FREE on orders above ₹499! We deliver to most major cities in 2-4 business days. Enter your PIN code on any product page to see the exact estimated delivery date.";
    } else if (q.includes('student') || q.includes('college') || q.includes('hostel')) {
      reply = "🎓 Student Mode is active! Toggle it on the homepage to unlock hostel study kits, coding bundles, and extra student discounts. You can verify using any college ID.";
    } else if (q.includes('refund') || q.includes('return') || q.includes('replace')) {
      reply = "🔄 We offer a hassle-free 7-day replacement policy on all original items. Simply initiate a return request from your Orders history tab, and our delivery partner will pick it up.";
    } else if (q.includes('points') || q.includes('score') || q.includes('earn')) {
      reply = "🏆 Your Shopping Score reflects your loyalty! You earn 10 points for every purchase, 15 points for submitting product reviews, and 50 points per referral. Redeem these points at checkout for direct discounts!";
    } else if (q.includes('laptop') || q.includes('coding') || q.includes('budget')) {
      reply = "💻 Looking for electronics? We have the Samsung S23 Ultra, MacBook Air M2, and OnePlus 11R. Try using our Smart Budget Builder or AI Copilot on the homepage for customized recommendations.";
    } else if (q.includes('group') || q.includes('friend') || q.includes('vote')) {
      reply = "👥 Shop With Friends is here! Share a Group Cart link, let your friends add products to the session, and vote on items before checking out. It makes group purchases incredibly simple!";
    } else {
      reply = "✨ I suggest checking out our homepage USP panel! You can find the AI Shopping Copilot, Smart Budget Builder, and Mood-Based Shopping tools there to find exactly what you need.";
    }

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
