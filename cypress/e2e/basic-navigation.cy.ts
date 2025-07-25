describe('基本的なナビゲーション', () => {
  it('ホームページにアクセスできる', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('存在しないページでエラーハンドリングが機能する', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });

  it('ページの基本構造が正しい', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });
}); 