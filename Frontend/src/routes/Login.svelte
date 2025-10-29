<script>
  import { loc } from "svelte-spa-router";

  let username = '';
  let password = '';
  let errorMessage = '';
  let realname = '';

  // 테스트용 로컬 계정 설정
  const LOCAL_ACCOUNTS = [
    { username: '이동현B', password: 'dkssudgktlsrk' },
    { username: 'test', password: 'test123' }
  ];

  async function handleLogin() {
    // 입력 검증
    if (!username || !password || !realname) {
      errorMessage = '아이디(+이름)와 비밀번호를 입력해주세요.';
      return;
    }

    // 로컬 계정 확인 (서버 통신 없이 즉시 로그인)
    const localAccount = LOCAL_ACCOUNTS.find(
      acc => acc.username === username && acc.password === password
    );

    if (localAccount) {
      // 로컬 계정 로그인 성공
      localStorage.setItem('username', username);
      localStorage.setItem('realname', realname);
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'index.html';
      return;
    }

    // 로컬 계정이 아니면 서버로 요청
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const result = await response.json();

      if (response.ok) {
        // 로그인 성공
        localStorage.setItem('username', result.username);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', result.token)
        window.location.href = 'index.html';
      } else {
        // 로그인 실패
        errorMessage = result.message || '로그인에 실패했습니다.';
      }
    } catch (error) {
       
      errorMessage = '서버 연결에 실패했습니다.';
      console.error('Login error:', error);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleLogin();
  }
</script>
<main>
  <div class="mycontainer" id="header">
    <div>
      Assembly Stock Simulation
    </div>

    <form on:submit={handleSubmit}>
      <input type="text" placeholder="아이디" bind:value={username} />

      <input type="password" placeholder="비밀번호" bind:value={password} />

      <input type = 'text' placeholder="이름" bind:value={realname} />

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      <div id="login">
        <button type="submit" class="btn-gradient blue mini">로그인</button>
        
        <button type="button" class="btn-gradient blue mini" on:click={() => (location.href = './registration.html')}>회원가입</button>
      </div>
    </form>
  </div>

  <footer>
    <img src="./src/assets/자산 5.png" alt="logo" />
    Assembly 2025
    </footer>
</main>

<style> 
  .error {
    color: red;
    font-size: 14px;
    margin: 10px 0;
    text-align: center;
  }
</style>