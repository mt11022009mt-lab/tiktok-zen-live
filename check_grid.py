from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1080, 'height': 1920})
    page.goto('http://localhost:3000/?layout=vertical')
    page.wait_for_timeout(2000)
    
    html = page.evaluate('document.getElementById("seats-grid").innerHTML')
    print('Seats grid HTML length:', len(html))
    
    page.screenshot(path='test_live_view2.png')
    browser.close()
print('SUCCESS!')
