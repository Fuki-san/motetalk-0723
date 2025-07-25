/// <reference types="cypress" />

// カスタムコマンドの型定義
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * ログイン処理
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * テンプレート購入フロー
       */
      purchaseTemplate(templateName: string): Chainable<void>;
      
      /**
       * 購入済みテンプレートの確認
       */
      verifyPurchasedTemplate(templateName: string): Chainable<void>;
    }
  }
}

// ログインコマンド
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="login-button"]').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
  cy.url().should('include', '/dashboard');
});

// テンプレート購入コマンド
Cypress.Commands.add('purchaseTemplate', (templateName: string) => {
  cy.visit('/templates');
  cy.contains(templateName).click();
  cy.get('[data-testid="purchase-button"]').click();
  
  // Stripeチェックアウトページの処理
  cy.url().should('include', 'checkout.stripe.com');
  
  // テスト用カード情報を入力
  cy.get('[data-testid="card-number"]').type('4242424242424242');
  cy.get('[data-testid="card-expiry"]').type('12/25');
  cy.get('[data-testid="card-cvc"]').type('123');
  cy.get('[data-testid="submit-button"]').click();
  
  // 成功ページにリダイレクト
  cy.url().should('include', '/success');
});

// 購入済みテンプレート確認コマンド
Cypress.Commands.add('verifyPurchasedTemplate', (templateName: string) => {
  cy.visit('/templates?view=purchased');
  cy.contains(templateName).should('be.visible');
  cy.get('[data-testid="template-content"]').should('be.visible');
}); 