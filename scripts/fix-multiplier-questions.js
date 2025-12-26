/**
 * Fix multiplier questions: 
 * - Change stem "= ×?" to "= ?"
 * - Change answer from "1,25" to "1,25x"
 */
import { readFileSync, writeFileSync } from 'fs'

const filePath = '/Users/luke/claude/tutor/data/source/content/o_x_vice.json'
const data = JSON.parse(readFileSync(filePath, 'utf8'))

let fixed = 0

for (const q of data.questions) {
  if (q.question.stem.includes('= ×?')) {
    // Fix stem
    q.question.stem = q.question.stem.replace('= ×?', '= ?')
    
    // Fix answer - add x if it's a number without x
    if (q.answer.correct && !q.answer.correct.includes('x')) {
      q.answer.correct = q.answer.correct + 'x'
    }
    
    // Update distractors to also have x? No - they should stay as wrong alternatives
    
    fixed++
    console.log(`Fixed: ${q.id} - ${q.question.stem} → ${q.answer.correct}`)
  }
}

writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
console.log(`\nTotal fixed: ${fixed}`)
