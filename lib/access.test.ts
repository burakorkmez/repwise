// npm test (Node strips the types)
import assert from "node:assert/strict"
import { test } from "node:test"
import { canReview, canWatchLesson } from "./access.ts"

test("canWatchLesson: preview, owner, and purchaser can watch; everyone else is locked", () => {
  const none = { isPreview: false, isOwner: false, hasPurchase: false }
  assert.equal(canWatchLesson({ ...none, isPreview: true }), true)
  assert.equal(canWatchLesson({ ...none, isOwner: true }), true)
  assert.equal(canWatchLesson({ ...none, hasPurchase: true }), true)
  assert.equal(canWatchLesson(none), false)
})

test("canReview: only purchasers, never yourself", () => {
  assert.equal(canReview({ isSelf: false, hasPurchase: true }), true)
  assert.equal(canReview({ isSelf: false, hasPurchase: false }), false)
  assert.equal(canReview({ isSelf: true, hasPurchase: true }), false)
})
