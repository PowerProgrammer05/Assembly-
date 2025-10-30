<script>
  import { onMount } from 'svelte';

  let clubRankings = [
    { clubName: 'Assembly', totalAssets: 15000000 },
    { clubName: 'Semicolon', totalAssets: 12500000 },
    { clubName: 'HIVE', totalAssets: 10200000 },
    { clubName: 'CodeLab', totalAssets: 9800000 },
    { clubName: 'DevSquad', totalAssets: 8500000 },
  ];
  
  let userRankings = [
    { username: 'PowerProgrammer05', totalAssets: 5000000 },
    { username: 'trader_king', totalAssets: 4500000 },
    { username: 'stock_master', totalAssets: 4200000 },
    { username: 'investor_pro', totalAssets: 3800000 },
    { username: 'money_maker', totalAssets: 3500000 },
    { username: 'bull_market', totalAssets: 3200000 },
    { username: 'diamond_hands', totalAssets: 3000000 },
    { username: 'moon_shot', totalAssets: 2800000 },
  ];
  
  let updateInterval;
  let lastUpdate = new Date().toLocaleTimeString('ko-KR');
  let isLoading = false;

  // 동아리별 랭킹 가져오기
  async function fetchClubRankings() {
    try {
      const res = await fetch('http://localhost:8000/api/rankings/clubs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      clubRankings = data.rankings || [];
    } catch (error) {
      console.error('동아리 랭킹 가져오기 실패:', error);
    }
  }

  // 개인별 랭킹 가져오기
  async function fetchUserRankings() {
    try {
      const res = await fetch('http://localhost:8000/api/rankings/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      userRankings = data.rankings || [];
    } catch (error) {
      console.error('개인 랭킹 가져오기 실패:', error);
    }
  }

  // 모든 랭킹 업데이트
  async function updateRankings() {
    isLoading = true;
    await Promise.all([
      fetchClubRankings(),
      fetchUserRankings()
    ]);
    isLoading = false;
    lastUpdate = new Date().toLocaleTimeString('ko-KR');
  }

  // 로그아웃
  function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('realname');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = 'login.html';
  }

  // 메인으로 돌아가기
  function goToMain() {
    window.location.href = 'index.html';
  }

  onMount(() => {
    // 초기 로드
    updateRankings();

    // 10초마다 랭킹 업데이트
    updateInterval = setInterval(() => {
      updateRankings();
    }, 10000);

    // 정리 함수
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  });
</script>

<main>
  <header>
    <div class="header-content">
      <h1>🏆 랭킹</h1>
      <div class="header-buttons">
        <button class="btn-home" on:click={goToMain}>🏠 메인으로</button>
        <button class="btn-logout" on:click={logout}>로그아웃</button>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="update-info">
      {#if isLoading}
        <span class="loading">🔄 업데이트 중...</span>
      {:else}
        <span>마지막 업데이트: {lastUpdate}</span>
      {/if}
    </div>

    <div class="rankings-grid">
      <!-- 동아리별 랭킹 -->
      <section class="ranking-section">
        <h2 class="section-title">🏛️ 동아리별 랭킹</h2>
        <div class="ranking-table">
          <div class="table-header">
            <span class="rank-col">순위</span>
            <span class="name-col">동아리</span>
            <span class="score-col">총 자산</span>
          </div>
          {#if clubRankings.length === 0}
            <div class="empty-message">랭킹 데이터가 없습니다.</div>
          {:else}
            {#each clubRankings as club, index}
              <div class="table-row" class:top-rank={index < 3}>
                <span class="rank-col">
                  {#if index === 0}
                    🥇
                  {:else if index === 1}
                    🥈
                  {:else if index === 2}
                    🥉
                  {:else}
                    {index + 1}위
                  {/if}
                </span>
                <span class="name-col">{club.clubName}</span>
                <span class="score-col">{club.totalAssets.toLocaleString()}원</span>
              </div>
            {/each}
          {/if}
        </div>
      </section>

      <!-- 개인별 랭킹 -->
      <section class="ranking-section">
        <h2 class="section-title">👤 개인별 랭킹</h2>
        <div class="ranking-table">
          <div class="table-header">
            <span class="rank-col">순위</span>
            <span class="name-col">사용자</span>
            <span class="score-col">총 자산</span>
          </div>
          {#if userRankings.length === 0}
            <div class="empty-message">랭킹 데이터가 없습니다.</div>
          {:else}
            {#each userRankings as user, index}
              <div class="table-row" class:top-rank={index < 3}>
                <span class="rank-col">
                  {#if index === 0}
                    🥇
                  {:else if index === 1}
                    🥈
                  {:else if index === 2}
                    🥉
                  {:else}
                    {index + 1}위
                  {/if}
                </span>
                <span class="name-col">{user.username}</span>
                <span class="score-col">{user.totalAssets.toLocaleString()}원</span>
              </div>
            {/each}
          {/if}
        </div>
      </section>
    </div>
  </div>
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Noto Sans KR', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px 0;
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    margin: 0;
    font-size: 2em;
    color: #333;
  }

  .header-buttons {
    display: flex;
    gap: 10px;
  }

  .btn-home, .btn-logout {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-home {
    background: #3c87ff;
    color: white;
  }

  .btn-home:hover {
    background: #2a6ed4;
    transform: translateY(-2px);
  }

  .btn-logout {
    background: #ff4444;
    color: white;
  }

  .btn-logout:hover {
    background: #e63946;
    transform: translateY(-2px);
  }

  .container {
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px;
    width: 100%;
  }

  .update-info {
    text-align: center;
    color: white;
    font-size: 0.95em;
    margin-bottom: 20px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  .loading {
    font-weight: 600;
  }

  .rankings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .ranking-section {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    margin: 0 0 20px 0;
    font-size: 1.5em;
    color: #333;
    border-bottom: 3px solid #667eea;
    padding-bottom: 10px;
  }

  .ranking-table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 80px 1fr 150px;
    padding: 12px 15px;
    background: #f8f9fa;
    border-radius: 8px;
    font-weight: 700;
    color: #555;
  }

  .table-row {
    display: grid;
    grid-template-columns: 80px 1fr 150px;
    padding: 15px;
    background: #fafafa;
    border-radius: 8px;
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .table-row:hover {
    background: #f0f0f0;
    transform: translateX(5px);
    border-color: #667eea;
  }

  .table-row.top-rank {
    background: linear-gradient(135deg, #fff8e1 0%, #ffe8a1 100%);
    font-weight: 600;
  }

  .table-row.top-rank:hover {
    background: linear-gradient(135deg, #ffecb3 0%, #ffd54f 100%);
  }

  .rank-col {
    text-align: center;
    font-size: 1.1em;
  }

  .name-col {
    font-size: 1.05em;
  }

  .score-col {
    text-align: right;
    font-weight: 600;
    color: #667eea;
  }

  .empty-message {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    font-size: 0.95em;
  }

  @media (max-width: 1024px) {
    .rankings-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 15px;
    }

    .table-header,
    .table-row {
      grid-template-columns: 60px 1fr 120px;
      padding: 10px;
      font-size: 0.9em;
    }

    .section-title {
      font-size: 1.2em;
    }
  }
</style>
