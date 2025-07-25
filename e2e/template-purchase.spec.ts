import { test, expect } from '@playwright/test';

test.describe('テンプレート購入フロー', () => {
  test('テンプレート購入から完了まで', async ({ page }) => {
    // 1. テンプレートページにアクセス
    await page.goto('http://localhost:3001/templates');
    
    // 2. 初回メッセージテンプレートを選択
    await page.click('text=初回メッセージ');
    
    // 3. 購入ボタンをクリック
    await page.click('button:has-text("購入する")');
    
    // 4. Stripeチェックアウトページの確認
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
    
    // 5. テスト用カード情報を入力
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    
    // 6. 購入を完了
    await page.click('button:has-text("支払いを完了")');
    
    // 7. 成功ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/success/);
    
    // 8. 購入済みページにリダイレクトされることを確認
    await page.waitForURL(/templates\?view=purchased/);
    
    // 9. 購入したテンプレートが表示されることを確認
    await expect(page.locator('text=初回メッセージ')).toBeVisible();
  });
}); 