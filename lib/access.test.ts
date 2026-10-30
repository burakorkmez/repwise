// npm test (Node strips the types)
import assert from "node:assert/strict"
import { test } from "node:test"
import { canMessage, canReview, canWatchLesson, isDerivedUrl, isFileIn } from "./access.ts"

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

test("isFileIn: one file directly inside the folder, no escaping it", () => {
  const folder = "/lessons/abc"
  assert.equal(isFileIn(folder, "/lessons/abc/squat_Xy12.mp4"), true)
  assert.equal(isFileIn(folder, "/lessons/abc/Übung_1.mov"), true)
  assert.equal(isFileIn(folder, "/lessons/abc/../xyz/their-video.mp4"), false)
  assert.equal(isFileIn(folder, "/lessons/abc/.."), false)
  assert.equal(isFileIn(folder, "/lessons/abc/sub/video.mp4"), false)
  assert.equal(isFileIn(folder, "/lessons/abcd/video.mp4"), false)
  assert.equal(isFileIn(folder, "/lessons/xyz/video.mp4"), false)
  assert.equal(isFileIn(folder, "/lessons/abc/"), false)
})

test("isDerivedUrl: the lesson's file and what the player derives from it, nothing else", () => {
  const file = "https://ik.imagekit.io/demo/lessons/abc/squat.mp4"
  assert.equal(isDerivedUrl(file, file), true)
  assert.equal(isDerivedUrl(`${file}/ik-master.m3u8?tr=sr-360_480_720_1080`, file), true)
  assert.equal(isDerivedUrl(`${file}/ik-seek-thumbnail-track.vtt`, file), true)
  assert.equal(isDerivedUrl(`${file}?tr=orig-true`, file), true)
  assert.equal(isDerivedUrl("https://ik.imagekit.io/demo/lessons/xyz/their-video.mp4", file), false)
  assert.equal(isDerivedUrl(`${file}/ik-x/../../../xyz/their-video.mp4`, file), false)
  assert.equal(isDerivedUrl(`${file}/ik-x/%2e%2e/%2e%2e/%2e%2e/xyz/their-video.mp4`, file), false)
  assert.equal(isDerivedUrl(`${file}.evil/x.mp4`, file), false)
  assert.equal(isDerivedUrl("not a url", file), false)
})
