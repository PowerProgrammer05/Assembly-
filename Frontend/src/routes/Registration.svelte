<script>
  let username = '';
  let password = '';
  let club = '';
  let errorMessage = '';

  // 동아리 코드 매핑 (value는 코드, label은 표시 이름)
  const clubs = [
    { code: 'GMSM',  name: '국문신문부' },
    { code: 'DSL',   name: '다산랩' },
    { code: 'LIOM',  name: '리옴' },
    { code: 'LIM',   name: '림' },
    { code: 'MEHL',  name: '메디홀릭' },
    { code: 'BK',    name: '브레인키' },
    { code: 'BSRA',  name: '브스라' },
    { code: 'SDLX',  name: '세드렉스' },
    { code: 'SERN',  name: '세렌디피티' },
    { code: 'SEBA',  name: '세록바이오' },
    { code: 'SECM',  name: '세록화학' },
    { code: 'SENV',  name: '센브이' },
    { code: 'SOVL',  name: '소셜밸류' },
    { code: 'ESPR',  name: '에스페라' },
    { code: 'MO',    name: '엠오' },
    { code: 'YNG',   name: '융' },
    { code: 'INY',   name: '인연' },
    { code: 'FINEA', name: '피네아' },
    { code: 'HAPAD', name: '하파드' },
    { code: 'HALF',  name: '하프' },
    { code: 'HBS',   name: '흐브스' },
    { code: 'HTRA',  name: '히스토리아' }
  ];

  async function handleRegistration() {
    if (!username || !password || !club) {
      errorMessage = '모든 항목을 입력해주세요.';
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password,
          club: club
        })
      });

      const result = await response.json();

      if (response.ok) {
        // 회원가입 성공
        alert('회원가입이 완료되었습니다.');
        window.location.href = 'login.html';
      } else {
        // 회원가입 실패
        errorMessage = result.message || '회원가입에 실패했습니다.';
      }
    } catch (error) {
      errorMessage = '서버 연결에 실패했습니다.';
      console.error('Registration error:', error);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleRegistration();
  }
</script>

<div class="mycontainer" id="header">
  <div>registration</div>

  <form on:submit={handleSubmit}>
    <input type="text" placeholder="아이디" bind:value={username} />
    <input type="password" placeholder="고유학번" bind:value={password} />

    <select bind:value={club}>
      <option value="" disabled selected>소속 동아리</option>
      {#each clubs as c}
        <option value={c.code}>{c.name}</option>
      {/each}
    </select>

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}

    <div id="login">
      <button type="button" class="btn-gradient blue mini" on:click={() => (location.href = './login.html')}>로그인</button>
      
      <button type="submit" class="btn-gradient blue mini">회원가입</button>
    </div>
  </form>
</div>

<style>
  /* 스타일은 registration.html의 <style>을 그대로 사용합니다. */
  .error {
    color: red;
    font-size: 14px;
    margin: 10px 0;
    text-align: center;
  }
</style>
