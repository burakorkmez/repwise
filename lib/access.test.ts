// npm test (Node strips the types)
import assert from "node:assert/strict"
import { test } from "node:test"
import { canMessage, canReview, canWatchLesson } from "./access.ts"

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

test("canMessage: needs a trainer on one side, never yourself", () => {
  assert.equal(canMessage({ isSelf: false, roles: ["client", "trainer"] }), true)
  assert.equal(canMessage({ isSelf: false, roles: ["trainer", "trainer"] }), true)
  assert.equal(canMessage({ isSelf: false, roles: ["client", "client"] }), false)
  assert.equal(canMessage({ isSelf: true, roles: ["trainer", "trainer"] }), false)
})
