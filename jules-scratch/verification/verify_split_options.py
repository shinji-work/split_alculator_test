from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    time.sleep(10)
    page.goto("http://localhost:3000")
    page.wait_for_selector("h1")
    page.get_by_role("combobox").nth(2).select_option("ratio")
    page.screenshot(path="jules-scratch/verification/verification_ratio.png")
    page.get_by_role("combobox").nth(2).select_option("manual")
    page.screenshot(path="jules-scratch/verification/verification_manual.png")
    browser.close()
