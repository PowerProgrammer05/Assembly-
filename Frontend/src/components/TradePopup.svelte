<script>
  export let show = false;
  export let companies = [];
  export let cash = 0;
  export let onBuy = (companyName, quantity, leverage, tradeType) => {};
  export let onSell = (companyName, quantity, leverage, tradeType) => {};
  export let onClose = () => {};

  // 거래 등록 폼 상태
  let selectedCompany = '';
  let selectedLeverage = 2;
  let tradeType = 'leverage'; // 'leverage' or 'inverse'
  let tradeQuantity = 0;

  const leverageOptions = [
    { label: '2배', value: 2 },
    { label: '3배', value: 3 },
    { label: '5배', value: 5 },
    { label: '10배', value: 10 }
  ];

  // 등록된 레버리지 거래 목록 (임시 데이터)
  let leverageTrades = [
    { id: 1, company: 'NVIDIA', leverage: 2, type: 'leverage', quantity: 10, user: '유저1' },
    { id: 2, company: 'GOOGLE', leverage: 3, type: 'inverse', quantity: 5, user: '유저2' },
    { id: 3, company: 'NEXON', leverage: 2, type: 'leverage', quantity: 20, user: '유저3' }
  ];

  $: if (companies.length > 0 && !selectedCompany) {
    selectedCompany = companies[0].name;
  }

  function registerTrade() {
    if (!selectedCompany || tradeQuantity <= 0) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const newTrade = {
      id: Date.now(),
      company: selectedCompany,
      leverage: selectedLeverage,
      type: tradeType,
      quantity: tradeQuantity,
      user: 'Me'
    };

    leverageTrades = [...leverageTrades, newTrade];
    
    // 폼 초기화
    tradeQuantity = 0;
    alert('거래가 등록되었습니다!');
  }

  function acceptTrade(trade) {
    // 거래 수락 로직
    if (trade.type === 'leverage') {
      onBuy(trade.company, trade.quantity, trade.leverage, 'leverage');
    } else {
      onSell(trade.company, trade.quantity, trade.leverage, 'inverse');
    }
    // 거래 목록에서 제거
    leverageTrades = leverageTrades.filter(t => t.id !== trade.id);
  }

  function deleteTrade(tradeId) {
    leverageTrades = leverageTrades.filter(t => t.id !== tradeId);
  }
</script>
<main></main>
{#if show}
  <div class="popup-overlay" on:click={onClose} role="dialog" aria-modal="true" tabindex="-1">
    <div class="popup-content" on:click|stopPropagation role="document">
      <button class="popup-close" on:click={onClose}>✕</button>
      <h2 class="popup-title">레버리지 거래소</h2>
      
      <div class="trade-main">
        <!-- 왼쪽: 등록된 거래 목록 -->
        <div class="trade-list-section">
          <h3 class="section-title">거래 대기 목록</h3>
          <div class="info-bar">
            <span class="info-item">💰 현금: <strong>{cash.toLocaleString()}원</strong></span>
          </div>
          
          <div class="trades-scroll">
            {#if leverageTrades.length === 0}
              <div class="empty-message">등록된 거래가 없습니다.</div>
            {:else}
              {#each leverageTrades as trade}
                <div class="trade-card">
                  <div class="trade-header">
                    <span class="trade-company">{trade.company}</span>
                    <span class="trade-leverage">{trade.leverage}배</span>
                  </div>
                  <div class="trade-info">
                    <span class="trade-type" class:leverage={trade.type === 'leverage'} class:inverse={trade.type === 'inverse'}>
                      {trade.type === 'leverage' ? '레버리지' : '인버스'}
                    </span>
                    <span>{trade.quantity}주</span>
                  </div>
                  <div class="trade-footer">
                    <span class="trade-user">등록자: {trade.user}</span>
                    <div class="trade-actions">
                      <button class="btn-accept" on:click={() => acceptTrade(trade)}>수락</button>
                      {#if trade.user === 'Me'}
                        <button class="btn-delete" on:click={() => deleteTrade(trade.id)}>삭제</button>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <!-- 오른쪽: 거래 등록 폼 -->
        <div class="trade-register-section">
          <h3 class="section-title">거래 등록</h3>
          
          <div class="register-form">
            <div class="form-group">
              <label for="company-select">종목 선택</label>
              <select id="company-select" bind:value={selectedCompany}>
                {#each companies as company}
                  <option value={company.name}>{company.name}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label>레버리지</label>
              <div class="leverage-selector">
                {#each leverageOptions as option}
                  <button 
                    class="leverage-btn" 
                    class:active={selectedLeverage === option.value}
                    on:click={() => selectedLeverage = option.value}
                  >
                    {option.label}
                  </button>
                {/each}
              </div>
            </div>

            <div class="form-group">
              <label>거래 유형</label>
              <div class="trade-type-selector">
                <button 
                  class="type-btn leverage" 
                  class:active={tradeType === 'leverage'}
                  on:click={() => tradeType = 'leverage'}
                >
                  레버리지
                </button>
                <button 
                  class="type-btn inverse" 
                  class:active={tradeType === 'inverse'}
                  on:click={() => tradeType = 'inverse'}
                >
                  인버스
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="quantity">수량</label>
              <input 
                id="quantity"
                type="number" 
                bind:value={tradeQuantity} 
                placeholder="거래할 수량 입력"
                min="1"
              />
            </div>

            <button class="btn-register" on:click={registerTrade}>거래 등록</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .popup-content {
    position: relative;
    background: white;
    border-radius: 12px;
    width: 95%;
    max-width: 1100px;
    height: 85vh;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .popup-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #ff4444;
    border: 2px solid white;
    color: white;
    font-size: 20px;
    font-weight: bold;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .popup-close:hover {
    background: #ff6666;
    transform: scale(1.1);
  }

  .popup-title {
    padding: 20px 30px;
    margin: 0;
    font-size: 1.5em;
    border-bottom: 2px solid #eee;
  }

  .trade-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* 왼쪽 영역: 거래 목록 */
  .trade-list-section {
    flex: 1;
    border-right: 2px solid #eee;
    display: flex;
    flex-direction: column;
  }

  .section-title {
    padding: 15px 20px;
    margin: 0;
    font-size: 1.1em;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
  }

  .info-bar {
    padding: 12px 20px;
    background: #fff8e1;
    border-bottom: 1px solid #eee;
  }

  .info-item {
    font-size: 0.95em;
    color: #555;
  }

  .trades-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
  }

  .empty-message {
    text-align: center;
    color: #999;
    padding: 40px 20px;
    font-size: 0.95em;
  }

  .trade-card {
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .trade-card:hover {
    background: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .trade-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .trade-company {
    font-size: 1.1em;
    font-weight: 700;
  }

  .trade-leverage {
    background: #3c87ff;
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 600;
  }

  .trade-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 0.95em;
  }

  .trade-type {
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.9em;
  }

  .trade-type.leverage {
    background: #00E396;
    color: white;
  }

  .trade-type.inverse {
    background: #FF4560;
    color: white;
  }

  .trade-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }

  .trade-user {
    font-size: 0.85em;
    color: #666;
  }

  .trade-actions {
    display: flex;
    gap: 6px;
  }

  .btn-accept, .btn-delete {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-accept {
    background: #3c87ff;
    color: white;
  }

  .btn-accept:hover {
    background: #2a6ed4;
  }

  .btn-delete {
    background: #ff4444;
    color: white;
  }

  .btn-delete:hover {
    background: #e63946;
  }

  /* 오른쪽 영역: 거래 등록 */
  .trade-register-section {
    width: 400px;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
  }

  .register-form {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.95em;
    color: #333;
  }

  .form-group select,
  .form-group input[type="number"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #aaa;
    border-radius: 6px;
    font-size: 0.95em;
    outline: none;
    background: white;
  }

  .form-group select:focus,
  .form-group input[type="number"]:focus {
    border-color: #3c87ff;
    box-shadow: 0 0 0 3px rgba(60, 135, 255, 0.1);
  }

  .leverage-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .leverage-btn {
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    background: white;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .leverage-btn:hover {
    border-color: #3c87ff;
    background: #f0f8ff;
  }

  .leverage-btn.active {
    border-color: #3c87ff;
    background: #3c87ff;
    color: white;
  }

  .trade-type-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .type-btn {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 1em;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-btn.leverage {
    background: white;
    color: #00E396;
    border-color: #00E396;
  }

  .type-btn.leverage:hover {
    background: #e8faf3;
  }

  .type-btn.leverage.active {
    background: #00E396;
    color: white;
  }

  .type-btn.inverse {
    background: white;
    color: #FF4560;
    border-color: #FF4560;
  }

  .type-btn.inverse:hover {
    background: #fff0f1;
  }

  .type-btn.inverse.active {
    background: #FF4560;
    color: white;
  }

  .btn-register {
    width: 100%;
    padding: 14px;
    background: #3c87ff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.05em;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 10px;
  }

  .btn-register:hover {
    background: #2a6ed4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(60, 135, 255, 0.3);
  }

  .btn-register:active {
    transform: translateY(0);
  }
</style>
