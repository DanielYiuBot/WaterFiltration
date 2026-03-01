/* ============================================================
   test-questions.js – Pre-test & Post-test Question Banks
   ============================================================
   Both tests have parallel questions (same concepts, different wording)
   to measure learning gain without simple memorization.
*/

const TestQuestions = {
  preTest: [
    {
      id: 'pre1',
      question: {
        zh: '在物理濾水系統中，下列哪種材料最適合放在濾水器的最上層？',
        en: 'In a physical water filtration system, which material is best suited for the top layer of a filter?'
      },
      options: {
        A: { zh: '棉花', en: 'Cotton' },
        B: { zh: '細砂', en: 'Fine Sand' },
        C: { zh: '大石子', en: 'Gravel' },
        D: { zh: '活性碳', en: 'Activated Carbon' },
      },
      correct: 'C',
    },
    {
      id: 'pre2',
      question: {
        zh: '濾水器中不同材料的正確排列順序（從上到下）應該是？',
        en: 'What is the correct order of materials in a water filter (from top to bottom)?'
      },
      options: {
        A: { zh: '棉花 → 細砂 → 活性碳 → 大石子', en: 'Cotton → Sand → Carbon → Gravel' },
        B: { zh: '大石子 → 細砂 → 活性碳 → 棉花', en: 'Gravel → Sand → Carbon → Cotton' },
        C: { zh: '細砂 → 大石子 → 棉花 → 活性碳', en: 'Sand → Gravel → Cotton → Carbon' },
        D: { zh: '活性碳 → 棉花 → 大石子 → 細砂', en: 'Carbon → Cotton → Gravel → Sand' },
      },
      correct: 'B',
    },
    {
      id: 'pre3',
      question: {
        zh: '活性碳在濾水系統中的主要功能是什麼？',
        en: 'What is the main function of activated carbon in a water filtration system?'
      },
      options: {
        A: { zh: '攔截大型固體雜質', en: 'Blocking large solid debris' },
        B: { zh: '過濾細小泥沙', en: 'Filtering fine sand particles' },
        C: { zh: '吸附異味和色素分子', en: 'Adsorbing odor and pigment molecules' },
        D: { zh: '防止其他濾材流失', en: 'Preventing other filter materials from escaping' },
      },
      correct: 'C',
    },
    {
      id: 'pre4',
      question: {
        zh: '如果將棉花放在濾水器的最上層，最可能發生什麼？',
        en: 'What is most likely to happen if cotton is placed at the top of the filter?'
      },
      options: {
        A: { zh: '水會被過濾得更乾淨', en: 'The water will be filtered more cleanly' },
        B: { zh: '濾水器會堵塞', en: 'The filter will become clogged' },
        C: { zh: '水流速度會加快', en: 'Water flow will speed up' },
        D: { zh: '不會有任何影響', en: 'There will be no effect' },
      },
      correct: 'B',
    },
    {
      id: 'pre5',
      question: {
        zh: '處理有臭味的池塘水時，哪種材料是不可或缺的？',
        en: 'When treating smelly pond water, which material is essential?'
      },
      options: {
        A: { zh: '大石子', en: 'Gravel' },
        B: { zh: '細砂', en: 'Fine Sand' },
        C: { zh: '棉花', en: 'Cotton' },
        D: { zh: '活性碳', en: 'Activated Carbon' },
      },
      correct: 'D',
    },
    {
      id: 'pre6',
      question: {
        zh: '大石子在濾水系統中的主要作用是什麼？',
        en: 'What is the main role of gravel in a water filtration system?'
      },
      options: {
        A: { zh: '去除水中的異味', en: 'Removing odor from water' },
        B: { zh: '攔截大型樹葉和碎石等雜質', en: 'Catching large debris like leaves and stones' },
        C: { zh: '過濾微小的細菌', en: 'Filtering tiny bacteria' },
        D: { zh: '使水變成藍色', en: 'Making water turn blue' },
      },
      correct: 'B',
    },
    {
      id: 'pre7',
      question: {
        zh: '為什麼濾水器的濾材要從大顆粒到小顆粒排列？',
        en: 'Why should filter materials be arranged from large to small particles?'
      },
      options: {
        A: { zh: '這樣看起來比較美觀', en: 'It looks more aesthetically pleasing' },
        B: { zh: '大顆粒先攔截大雜質，避免小顆粒濾材堵塞', en: 'Large particles catch big debris first, preventing clogging of finer materials below' },
        C: { zh: '讓水流得更慢', en: 'To slow down the water flow' },
        D: { zh: '沒有特別的原因，順序不重要', en: 'There is no particular reason; the order does not matter' },
      },
      correct: 'B',
    },
    {
      id: 'pre8',
      question: {
        zh: '棉花在濾水系統中放在最底層的主要原因是？',
        en: 'What is the main reason for placing cotton at the bottom of a filtration system?'
      },
      options: {
        A: { zh: '棉花可以吸附氣味', en: 'Cotton can adsorb odors' },
        B: { zh: '棉花可以殺死細菌', en: 'Cotton can kill bacteria' },
        C: { zh: '防止上層的細砂流失，同時捕捉剩餘微粒', en: 'Preventing sand from escaping while catching remaining fine particles' },
        D: { zh: '棉花可以讓水流更快', en: 'Cotton makes water flow faster' },
      },
      correct: 'C',
    },
  ],

  postTest: [
    {
      id: 'post1',
      question: {
        zh: '建造濾水器時，最上層應該放什麼材料？',
        en: 'When building a water filter, what material should be placed at the top?'
      },
      options: {
        A: { zh: '活性碳', en: 'Activated Carbon' },
        B: { zh: '大石子', en: 'Gravel' },
        C: { zh: '棉花', en: 'Cotton' },
        D: { zh: '細砂', en: 'Fine Sand' },
      },
      correct: 'B',
    },
    {
      id: 'post2',
      question: {
        zh: '一個有效的濾水器，材料從上到下的最佳順序是？',
        en: 'For an effective water filter, what is the best order of materials from top to bottom?'
      },
      options: {
        A: { zh: '細砂 → 棉花 → 大石子 → 活性碳', en: 'Sand → Cotton → Gravel → Carbon' },
        B: { zh: '活性碳 → 大石子 → 細砂 → 棉花', en: 'Carbon → Gravel → Sand → Cotton' },
        C: { zh: '大石子 → 細砂 → 活性碳 → 棉花', en: 'Gravel → Sand → Carbon → Cotton' },
        D: { zh: '棉花 → 活性碳 → 細砂 → 大石子', en: 'Cotton → Carbon → Sand → Gravel' },
      },
      correct: 'C',
    },
    {
      id: 'post3',
      question: {
        zh: '為了去除水中的臭味，你應該在濾水器中加入哪種材料？',
        en: 'To remove odor from water, which material should you add to the filter?'
      },
      options: {
        A: { zh: '更多的大石子', en: 'More gravel' },
        B: { zh: '活性碳', en: 'Activated Carbon' },
        C: { zh: '更多的細砂', en: 'More fine sand' },
        D: { zh: '更多的棉花', en: 'More cotton' },
      },
      correct: 'B',
    },
    {
      id: 'post4',
      question: {
        zh: '把棉花放在濾水器頂部會導致什麼問題？',
        en: 'What problem does placing cotton at the top of the filter cause?'
      },
      options: {
        A: { zh: '水會變得更清澈', en: 'Water becomes clearer' },
        B: { zh: '不會有問題', en: 'No problem at all' },
        C: { zh: '濾水器會堵塞，水無法通過', en: 'The filter gets clogged and water cannot pass through' },
        D: { zh: '活性碳會失效', en: 'Activated carbon stops working' },
      },
      correct: 'C',
    },
    {
      id: 'post5',
      question: {
        zh: '處理池塘水（有臭味）和河水（僅有泥沙）的濾水器設計有什麼不同？',
        en: 'How does the filter design differ between treating pond water (with odor) and river water (only turbid)?'
      },
      options: {
        A: { zh: '池塘水不需要濾水器', en: 'Pond water does not need a filter' },
        B: { zh: '河水需要活性碳但池塘水不需要', en: 'River water needs activated carbon but pond water does not' },
        C: { zh: '池塘水必須加入活性碳來去除異味', en: 'Pond water requires activated carbon to remove odor' },
        D: { zh: '兩者的設計完全相同', en: 'Both designs are exactly the same' },
      },
      correct: 'C',
    },
    {
      id: 'post6',
      question: {
        zh: '大石子（粗濾材）放在最上層的原因是什麼？',
        en: 'Why is gravel (coarse filter material) placed at the top?'
      },
      options: {
        A: { zh: '大石子最便宜', en: 'Gravel is the cheapest' },
        B: { zh: '大石子可以先攔截大型雜質，保護下方較細的濾材不被堵塞', en: 'Gravel catches large debris first, protecting finer materials below from clogging' },
        C: { zh: '大石子可以去除臭味', en: 'Gravel removes odor' },
        D: { zh: '大石子最重，自然會沉在上面', en: 'Gravel is heaviest, so it naturally stays on top' },
      },
      correct: 'B',
    },
    {
      id: 'post7',
      question: {
        zh: '如果濾水器中只放了大石子和細砂（沒有活性碳和棉花），過濾發臭的池塘水後，水質會如何？',
        en: 'If a filter only contains gravel and sand (no carbon or cotton), what would the water be like after filtering smelly pond water?'
      },
      options: {
        A: { zh: '水會變清澈，但臭味還在', en: 'Water becomes clear, but the smell remains' },
        B: { zh: '水會完全乾淨，沒有任何問題', en: 'Water becomes completely clean with no issues' },
        C: { zh: '水會比過濾前更髒', en: 'Water becomes dirtier than before filtering' },
        D: { zh: '水會變成藍色', en: 'Water turns blue' },
      },
      correct: 'A',
    },
    {
      id: 'post8',
      question: {
        zh: '在一個完整的物理濾水系統中，棉花應該放在什麼位置？為什麼？',
        en: 'In a complete physical filtration system, where should cotton be placed and why?'
      },
      options: {
        A: { zh: '最上層，因為棉花最能攔截大雜質', en: 'At the top, because cotton catches large debris best' },
        B: { zh: '中間層，因為棉花需要和活性碳一起使用', en: 'In the middle, because cotton needs to work with carbon' },
        C: { zh: '最底層，因為棉花可以防止細砂流失並過濾最細的微粒', en: 'At the bottom, because cotton prevents sand from escaping and filters the finest particles' },
        D: { zh: '不需要棉花，其他材料就夠了', en: 'Cotton is not needed; other materials are sufficient' },
      },
      correct: 'C',
    },
  ],

  gradeTest(testType, answers) {
    const questions = this[testType];
    let score = 0;
    const maxScore = questions.length;

    for (const q of questions) {
      if (answers[q.id] === q.correct) {
        score++;
      }
    }

    return { score, maxScore };
  },
};

window.TestQuestions = TestQuestions;
