
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Novels page verification
    page.goto("http://localhost:3000/novels")
    page.get_by_role("link", name="クイズに挑戦").click()
    page.wait_for_url("http://localhost:3000/games/quiz")
    page.screenshot(path="jules-scratch/verification/quiz-page.png")

    page.goto("http://localhost:3000/novels")
    page.get_by_role("link", name="動画を見る").click()
    page.wait_for_url("http://localhost:3000/videos")
    page.screenshot(path="jules-scratch/verification/videos-page.png")

    # Footer verification
    footer_games_link = page.get_by_role("link", name="ゲーム")
    footer_videos_link = page.get_by_role("link", name="動画")

    assert footer_games_link.is_visible()
    assert footer_videos_link.is_visible()
    page.screenshot(path="jules-scratch/verification/footer.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
