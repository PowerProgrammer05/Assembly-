<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let username = localStorage.getItem('username') || 'Guest';
  let usercash = 0;
  let userid = '';

  async function getinfo(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  
  if (localStorage.getItem('isLoggedIn') === null) {
    localStorage.setItem('isLoggedIn', 'false');
  }

  function logout() {
    localStorage.removeItem('username');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = 'login.html';
  }

  function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
  
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

    function priceup(companyName){
        return postAPI('/api/priceup',JSON.stringify({companyName}));

    }
    function pricedown(companyName){
        return postAPI('/api/pricedown',JSON.stringify({companyName}));

    }

    function intputmoney(amount, id){
        return postAPI('/api/intputmoney',JSON.stringify({amount, id}));
    }

  // 폼 제출 처리: 기본 제출 막고 비동기 호출/에러 처리
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const res = await intputmoney(Number(usercash), userid);
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${msg}`);
      }
      alert('입금이 완료되었습니다.');
      usercash = 0;
      userid = '';
    } catch (e) {
      console.error('입금 실패:', e);
      alert('서버 연결 오류 또는 요청 실패입니다.');
    }
  }

  onMount(async () => {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return; 
    }
    
    try{

    }catch (error) {
      console.error('데이터 로드 실패', error);
    }

  });

  

</script>

<header>
  <span id="ttl">Stock Simulation Game</span>
      <span id="growing-banner">
          <div>{username}</div>
    <button id="logout" class="btn-gradient blue mini" on:click={logout}>logout</button>
      </span>
  </header>

  <main>
    <h2>Master Page</h2>
    <form on:submit|preventDefault={handleSubmit}>
      <input type= "text" placeholder="User ID" bind:value={userid} />
      <input type= "number" placeholder="금액" bind:value={usercash} />
       <button type="submit" class="btn-gradient blue mini">입금</button>
    </form>
   
  </main>
    





<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');

        body {
            /* font-family: "Noto Sans KR", sans-serif;
            font-optical-sizing: auto;
            font-style: normal; */
            margin:0
        }
        header {
            display: flex;
            padding: 20px 30px;
            border-bottom: solid;
            border-color: #777;
            border-width: 1px;
        }
        #ttl {
            font-size: 1.5em;
        }
        #growing-banner {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            flex-grow: 1
        }
        #brd {
            height: 35px;
            border-left: solid;
            border-color: #777;
            border-width: 1px;
            margin: 0 20px;

        }
        .wealth + .wealth {
            margin-left: 20px;
        }
</style>
