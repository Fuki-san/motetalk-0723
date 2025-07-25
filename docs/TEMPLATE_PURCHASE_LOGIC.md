# テンプレート購入の仕組み

## 基本概念

### 1. サブスクリプション（プレミアムプラン）とテンプレート購入は完全に別の商品

- **プレミアムプラン**: 月額サブスクリプション（AI返信生成機能の利用）
- **テンプレート購入**: 買い切り商品（テンプレートパックの利用）

### 2. テンプレート表示の統一ルール

**サブスク会員も無料会員も全く同じ表示**

#### ショップページ
- 未購入のテンプレートのみ表示
- 1つのテンプレートのみプレビュー表示（内容は一部のみ）
- 購入済みテンプレートもプレビューのみ表示（全内容は購入済みページで確認）
- 購入ボタンでテンプレートパックを購入

#### 購入済みページ
- 実際に購入したテンプレートのみ表示
- 全テンプレートの内容を表示
- コピー機能でテンプレートをコピー可能

### 3. 重要なポイント

- **プレミアムプランに入っていても、テンプレートは購入しないと利用できない**
- **プレミアムプランで全テンプレートが自動的に利用可能になることはない**
- **サブスク会員も無料会員も、テンプレートは個別に購入が必要**

## 実装詳細

### フロントエンド（Templates.tsx）
```typescript
// 購入済みモード: 実際に購入したテンプレートのみ表示（サブスク会員も無料会員も同じ）
const purchasedCategories = templateCategories.filter(category => 
  purchasedTemplates.includes(category.id)
);

// ショップモード: 未購入のテンプレートを表示（サブスク会員も無料会員も同じ）
const availableCategories = templateCategories.filter(category => {
  const isPurchased = purchasedTemplates.includes(category.id);
  return !isPurchased;
});

// テンプレート表示ロジック
{viewMode === 'purchased' && purchasedTemplates.includes(selectedCategoryData.id) ? (
  // 購入済みモード: 購入済みテンプレートの全内容を表示
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <div className="flex items-center space-x-2 mb-4">
      <Check className="w-5 h-5 text-green-500" />
      <h3 className="text-lg font-semibold text-gray-800">購入済みテンプレート</h3>
    </div>
    <div className="space-y-3">
      {selectedCategoryData.templates.map((template, index) => (
        <div key={template.id} className="flex items-start space-x-3">
          <span className="text-purple-600 font-medium mt-1">{index + 1}.</span>
          <div className="flex-1">
            <p className="text-gray-800 leading-relaxed">{template.content}</p>
            <button
              onClick={() => handleCopyTemplate(template)}
              className="mt-2 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedTemplateId === template.id ? 'コピーしました！' : 'コピー'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
) : viewMode === 'shop' ? (
  // ショップモード: プレビューのみ表示（購入済みでも未購入でも）
  <div className="grid grid-cols-1 gap-6">
    {selectedCategoryData.templates.slice(0, 1).map((template) => (
      <div key={template.id} className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {purchasedTemplates.includes(selectedCategoryData.id) 
                  ? 'プレビュー（購入済み - 購入済みページで全内容を確認）' 
                  : 'プレビュー（購入で全30種解放）'
                }
              </span>
            </div>
            <p className="text-gray-800 leading-relaxed">
              {template.content.substring(0, 40)}...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span>
              {purchasedTemplates.includes(selectedCategoryData.id)
                ? '購入済み - 購入済みページで全テンプレートを確認'
                : '購入後に全30種のテンプレートが利用可能'
              }
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

### バックエンド（API）
```javascript
// サブスク会員も無料会員も実際に購入したテンプレートのみ利用可能
const availableTemplates = uniquePurchasedTemplates;

// Webhook処理でテンプレートIDを正しく特定
for (const item of lineItems) {
  const priceId = item.price?.id;
  console.log('🔍 handleTemplatePurchase - priceId:', priceId);
  // Identify templateId from priceId (same logic as savePurchaseToDatabase)
  if (priceId === 'price_1Rl6WZQoDVsMq3SibYnakW14') {
    templateId = 'first_message_pack';
    console.log('✅ priceIdから初回メッセージテンプレートを特定');
  } else if (priceId === 'price_1Roiu5QoDVsMq3SiYXbdh2xT') {
    templateId = 'date_invitation_pack';
    console.log('✅ priceIdからデート誘いテンプレートを特定');
  } else if (priceId === 'price_1RoiuyQoDVsMq3Si9MQuzT6x') {
    templateId = 'conversation_topics_pack';
    console.log('✅ priceIdから会話ネタテンプレートを特定');
  } else {
    templateId = null;
    console.log('❓ 未知のpriceId、templateIdはnull');
  }
  if (templateId) break;
}
```

## データベース構造

### usersコレクション
- `purchasedTemplates`: 購入済みテンプレートIDの配列
- `plan`: 'premium' または 'free'

### template_purchasesコレクション
- テンプレート購入履歴
- `templateId`: テンプレートID
- `userId`: ユーザーID
- `purchasedAt`: 購入日時

### purchasesコレクション
- 全購入履歴（テンプレート + サブスクリプション）
- `type`: 'template' または 'subscription'
- `templateId`: テンプレートID（priceIdから特定）
- `templateName`: テンプレート名
- `amount`: 購入金額

## 修正履歴

### ✅ 2025-07-25: テンプレート表示ロジックの完全修正

#### 修正内容
1. **プレミアムパックの完全削除**
   - `src/data/templateData.ts`から`premium_pack`定義を削除
   - `src/components/Templates.tsx`から`isPremium`チェックを削除

2. **ショップページでの購入済みテンプレート表示制御**
   - 購入済みテンプレートもプレビューのみ表示
   - 全内容は購入済みページでのみ表示

3. **Webhook処理の改善**
   - `line_items`の展開を追加
   - `priceId`ベースのテンプレート特定ロジックを統一

4. **null値フィルタリング**
   - サーバー側とフロントエンド側でnull値を除外

#### テスト結果
- ✅ デート誘いテンプレートの購入が正常に処理される
- ✅ 購入済みページで正しいテンプレートが表示される
- ✅ ショップページで購入済みテンプレートはプレビューのみ表示
- ✅ プレミアムパックが表示されない

## テストシナリオ

1. **無料会員がテンプレートを購入**
   - ショップでテンプレートを選択
   - 購入完了後、購入済みページに表示される

2. **プレミアム会員がテンプレートを購入**
   - 無料会員と同じ動作
   - プレミアムプランはテンプレート購入に影響しない

3. **プレミアム会員がテンプレートを購入していない場合**
   - 購入済みページは空
   - ショップページでテンプレートを購入する必要がある

4. **ショップページでの購入済みテンプレート表示**
   - 購入済みテンプレートはプレビューのみ表示
   - 全内容は購入済みページでのみ確認可能 