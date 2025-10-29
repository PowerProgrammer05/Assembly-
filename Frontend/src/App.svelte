<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import TradePopup from './components/TradePopup.svelte';

  let username = localStorage.getItem('username') || 'Guest';
  let token = localStorage.getItem('token');
  let cash = 0; 
  let assets = 0; 
  let user_stocks = {'NVIDIA': 100, 'GOOGLE': 0, 'NEXON': 0, 'CELLTRION': 0, 'PFIZER': 0, 'HIVE': 0, 'StarkIndustries': 0, 'POSCO': 0, '성현코인': 0, 'Assembly': 0};  //사용자 보유 주식량
  let companies = [ {name: 'NVIDIA', code: 'NVDA', price: [1,2,5,9,23,52,3,1,5,7,9,13,4,5,6,7,8,8,3,6.6]}, 
                    {name: 'GOOGLE', code: 'GOOGL', price: [1,10]},
                    {name: 'NEXON', code: 'NEXON', price: [1,10]} , {name: 'CELLTRION', code: 'CTRN', price: [1,10]}, {name : 'PFIZER', code: 'PFE', price: [1,10]}, {name: 'HIVE', code: 'HIVE', price: [1,10]}, {name: 'StarkIndustries', code: 'STID', price: [9,10]}, {name: 'POSCO', code: 'PSCO', price: [900,1230]}, {name: '성현코인', code: 'SC', price: [1,10]}, {name: 'Assembly', code: 'ASS', price: [1,10]}];  // 현재 시장 정보 (서버에서 받아옴)
  
  let tradeQuantities = {}; // 각 회사별 거래 수량 입력값
  
  let showGamePopup = false;
  let showTradePopup = false;
  
  let chart = null; // ApexCharts 인스턴스
  let selectedCompany = null; // 현재 그래프에 표시 중인 회사

  // 공통 GET 함수
  async function getinfo(url) {
    const res = await fetch(url); 
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function getInitialPrice(url, companyName) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code : companyName })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
    
  }

  async function getNewPrice(url, companyName) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: companyName })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  if (localStorage.getItem('isLoggedIn') === null) {
    localStorage.setItem('isLoggedIn', 'false');
  }

  function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('realname');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = 'login.html';
  }

  function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  function openGamePopup() {
    showGamePopup = true;
  }

  function closeGamePopup() {
    showGamePopup = false;
  }

  function openTradePopup() {
    showTradePopup = true;
  }

  function closeTradePopup() {
    showTradePopup = false;
  }

  function showGraph(companyName) {
    selectedCompany = companyName;
    const company = companies.find(c => c.name === companyName);
    if (!company || !chart) return;

    // price 배열을 막대 그래프 형식으로 변환
    const chartData = company.price.map((price, index) => {
      const timestamp = Date.now() - (company.price.length - index - 1) * 30000; // 30초 간격
      const prevPrice = index > 0 ? company.price[index - 1] : price;
      return {
        x: timestamp,
        y: [prevPrice, price], // [시작점, 끝점]
        fillColor: price >= prevPrice ? '#00E396' : '#FF4560' // 상승: 초록, 하락: 빨강
      };
    });

    chart.updateSeries([{
      name: companyName,
      data: chartData
    }]);
  }

    //공동 POST
  async function postAPI(url,jsonStr){
    try {const res= await fetch(url,{
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
            body: jsonStr,      
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    return res;  
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  }

  function buystock(companyName, quantity, leverage = 1, tradeType = 'buy'){
    try {
      const stockPrice = companies.find(c => c.name === companyName).price[companies.find(c => c.name === companyName).price.length -1];
      if (!companyName || quantity <= 0) {
        throw new Error('유효한 회사 이름과 수량을 입력해주세요.');
      }
      const requiredCash = (quantity * stockPrice) / leverage;
      if (cash < requiredCash){
        throw new Error('잔액이 부족합니다.');
      }
      return postAPI(`/trade/${token}`,JSON.stringify({ 
        stock_id: companies.find(c => c.name === companyName).code, 
        quantity: quantity, 
        trade_type: tradeType,
        leverage: leverage
      }));
    } catch (error) {
      alert(error.message);
      throw error;
    }
  }

  function sellstock(companyName, quantity, leverage = 1, tradeType = 'sell'){
    try {
     const stockPrice = companies.find(c => c.name === companyName).price[companies.find(c => c.name === companyName).price.length -1];
    if (!companyName || quantity <= 0) {
      throw new Error('유효한 회사 이름과 수량을 입력해주세요.');
    }
    const requiredCash = (quantity * stockPrice) / leverage;
    if (cash < requiredCash){
      throw new Error('잔액이 부족합니다.');
    }
    return postAPI(`/trade/${token}`,JSON.stringify({ 
      stock_id: companies.find(c => c.name === companyName).code, 
      quantity: quantity, 
      trade_type: tradeType,
      leverage: leverage
    }));
    }catch (error) {
      alert(error.message);
      throw error;
      }
  }
  //주식 정보 업데이트
  async function updateStock() {
    try {
      // {'name': '삼성', code : 'SAM', price': 123132}, {'name' : 'LG', price : 123313} 이렇게 순차적으로
      for (let i=0;i < 10;i++){
        const stockdata = await getNewPrice(`/trade/stockupdate`, companies[i].code);
        const latestPrice = stockdata.price;
        const company = companies.find(c => c.name === stockdata.name);
        if (company && company.price) {
          company.price.push(latestPrice);
          company.price.shift();
        }
      }
      
      companies = companies;

      return;
    } catch (error) {
      console.error('주식 정보 업데이트 실패', error);
      throw error;
    }
  }

  async function updatePage(){
    await updateStock();
    try{
      const userdata = await getinfo(`/user/userinfo/${username}`); // ex) {id: "손우정", cash: 1000000, assets: 1500000, stocks: {"삼성": 10, "LG": 5}}
      cash = userdata.cash;
      assets = 0; // assets 초기화
      for (let i in user_stocks) {
        assets += user_stocks[i] * companies.find(c => c.name === i).price[companies.find(c => c.name === i).price.length - 1];
      }
      user_stocks = userdata.stocks;   
    } catch (error) {
      console.error('데이터 로드 실패', error);
    }
  }

  //초기 데이터 로드
  onMount(() => {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return; 
    }
    if (username === "이동현B" || username === "성현게이"){
      window.location.href = 'master.html';
      return;
    }
    
    // ApexCharts 라이브러리 동적 로드
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
    script.onload = () => {
      // 차트 초기화
      const options = {
        series: [{
          name: '주가',
          data: []
        }],
        chart: {
          type: 'rangeBar',
          height: window.innerHeight - 110,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            rangeBarGroupRows: false
          },
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime'
        },
        yaxis: {
          title: {
            text: '가격 (원)'
          }
        },
        colors: ['#00E396'],
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toLocaleString() + "원"
            }
          }
        }
      };
      // @ts-ignore - ApexCharts는 CDN에서 동적 로드됨
      chart = new window.ApexCharts(document.querySelector("#chart"), options);
      chart.render();
    };
    document.head.appendChild(script);
    
    // 비동기 초기화 함수
    (async () => {
      try {
        //기본 정보 받아오기
        const userdata = await getinfo(`/user/userinfo/${username}`); // ex) {username: "손우정", cash: 1000000, stocks: {"삼성": 10, "LG": 5}}
        cash = userdata.cash;                            // Id는 필요없긴 한데 같이 들어있을 것 같아서 적어놓음
        user_stocks = userdata.stocks;

        for (let i=0;i < 10;i++){
          const stockdata = await getInitialPrice(`/trade/stocks`, companies[i].code); // ex) {name: "삼성", code: 'SAM', price: [50000, 51000, 52000, ...10개]}
          const company = companies.find(c => c.name === stockdata.name);
          if (company) {
            company.price = stockdata.price;
          }
        }
        companies = companies; // Svelte 반응성 트리거
      } catch (error) {
        console.error('데이터 로드 실패', error);
      }
    })();

    // 주기적으로 업데이트 (5초마다)
    const interval = setInterval(() => {
      updatePage();
    }, 100);

    // cleanup: 컴포넌트 언마운트 시 interval 정리
    return () => {
      clearInterval(interval);
      if (chart) chart.destroy();
    };
  });

</script>


<main>
  <header>
  <span id="ttl">Stock Simulation Game</span>
      <span class="growing-banner">
          <div>{username}</div>
          <span id="brd"></span>
          <div class="wealth">보유자산가치: {assets.toLocaleString()}원</div>
          <div class="wealth">현금: {cash.toLocaleString()}원</div>
          <span id="brd"></span>
    <button class="btn-gradient blue mini" on:click={openTradePopup}>leverage</button>
    <button class="btn-gradient blue mini" on:click={openGamePopup}>game</button>
    <button id="logout" class="btn-gradient blue mini" on:click={logout}>logout</button>
      </span>
  </header>

   <div id="realbody">
        <section id="stock-graph">
            <div id="chart"></div>
        </section>


        <aside>
            {#each companies as company}
            <div class="stock-container">
                <div class="stock-item">
                    <span>
                        <div class="stock-name">{company.name}</div>
                        {#if company.price[company.price.length - 1] > company.price[company.price.length - 2]}
                          <span class="upward fluctuation">+{((company.price[company.price.length - 1] - company.price[company.price.length - 2]) / company.price[company.price.length - 2] * 100).toFixed(2)}%</span>
                        {:else}
                          <span class="downward fluctuation">-{(( company.price[company.price.length - 2] - company.price[company.price.length - 1]) / company.price[company.price.length - 2] * 100).toFixed(2)}%</span>
                        {/if}
                    </span>
                    <span>
                        <div class="stock-price">{company.price[company.price.length - 1].toLocaleString()}원</div>
                        <span class="stock-holding">{user_stocks[company.name] || 0}주 보유</span>
                    </span>
                    <button class="graph-btn" on:click={() => showGraph(company.name)}>그래프 보기</button>
                </div>
                <div class="transaction">
                    <div class="upper">
                        <label class="stock-amount">거래 수량 :</label>
                        <input class="stock-amount-input" type="number" bind:value={tradeQuantities[company.name]} placeholder="숫자를 입력하렴">
                        <button class="buy-btn" on:click={() => buystock(company.name, tradeQuantities[company.name])}>매수</button>
                        <button class="sell-btn" on:click={() => sellstock(company.name, tradeQuantities[company.name])}>매도</button>
                    </div>
                    <div class="stock-cost">거래 금액 : &nbsp;&nbsp;0원</div>
                </div>
            </div>
            {/each}
        </aside>
    </div>

</main>

{#if showGamePopup}
  <div class="popup-overlay" on:click={closeGamePopup}>
    <div class="popup-content" on:click|stopPropagation>
      <button class="popup-close" on:click={closeGamePopup}>✕</button>
  <iframe src="juk7.html" title="죽림고수 게임" class="game-iframe"></iframe>
    </div>
  </div>
{/if}

<TradePopup 
  show={showTradePopup}
  {companies}
  {cash}
  onBuy={buystock}
  onSell={sellstock}
  onClose={closeTradePopup}
/>





<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');
  main {
    font-family: "DM Sans", "Noto Sans KR", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    margin:0
  }
  

  header {
        display: flex;
        align-items: center;
        padding: 20px 30px;
        border-bottom: solid #777 1px;
        }
  #ttl {
        font-size: 1.5em;
        display: flex;
        font-weight: 300;
        font-style: italic;
    }
    .growing-banner {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1
    }
    #brd {
        height: 35px;
        border-left: solid #777 1px;
        margin: 0 20px;
    }
    button {
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button:active {
        transform: translateY(2px);
    }
    #logout {
        padding: 7px 10px;
        background-color: #3c87ff;
        color: white;
        transition: background-color .1s linear
    }
    #logout:hover {
        background-color: #3070d6;
    }
    .wealth + .wealth {
        margin-left: 20px;
    }
    .wealth {
        font-size: 0.9em;
    }
    #realbody {
        display: flex;
    }
    aside {
        overflow: scroll;
        max-height: calc(100vh - 79px);
    }
    /* aside {
        border-left: solid #777 1px;
    } */
    .stock-container {
        transition: .15s ease-out;
    }
    .stock-item {
        display: flex;
        padding: 15px 0 15px 40px;
        width: 400px;
        cursor: pointer;
        align-items: center;
        transition: padding .15s ease-out;
    }
    .stock-container:hover .stock-item {
        padding: 15px 20px 15px 20px;
    }
    .stock-container:hover {
        background-color: #f6f6f6;
    }
    .graph-btn {
        display: none;
        font-size: 0.9em;
        background-color: #ddd;
        transition: background-color .1s linear, color .1s linear;
        padding: 7px 10px;
    }
    .stock-container:hover button {
        display: inline-block;
    }
    .stock-item button:hover {
        background-color: #444;
        color: white;
    }
    .stock-container + .stock-container {
        border-top: solid #777 1px;
    }
    .stock-name {
        font-size: 1.3em;
        width: 150px;
    }
    .upward {
        color: red;
    }
    .downward {
        color: blue;
    }
    .stock-holding {
        font-size: 0.9em;
    }
    .stock-price {
        font-size: 1.3em;
        font-weight: 600;
        width: 150px;
    }
    .transaction {
        height: 0;
        overflow: hidden;
        transition: .15s ease-out;
    }
    .upper {
        display: flex;
        align-items: center;
    }
    .stock-container:hover .transaction {
        height: 65px;
    }
    #stock-graph {
        flex-grow: 1;
    }
    .stock-amount {
        margin: 0 10px 0 20px;
        font-size: .9em;
    }
    .stock-cost {
        margin: 2px 10px 0 20px;
        font-size: .9em;
    }
    .stock-amount-input {
        border: solid #aaa 1px;
        outline: none;
        border-radius: 4px;
        padding: 4px 5px;
        width: 95px;
    }
    .transaction button {
        background-color: #ddd;
        font-size: .9em;
        padding: 5px 7px;
        transition: background-color .1s linear, color .1s linear;
    }
    .buy-btn {
        margin: 0 5px 0 10px;
    }
    .transaction button:hover {
        background-color: #444;
        color: white;
    }

    /* 팝업 스타일 */
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
        background: #0b1020;
        border-radius: 12px;
        width: 90%;
        max-width: 800px;
        height: 80vh;
        max-height: 600px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        overflow: hidden;
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

    .game-iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>

