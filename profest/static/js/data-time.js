const clock = new Vue({
  delimiters: ['[[',']]'],
  el: '#clock',
  data() {
      return {
          time: '',
          date: ''
      };
    }
  });

  setInterval(updateTime, 1000);
  updateTime();

  function updateTime() {
      const cd = new Date();
      clock.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
      clock.date = zeroPadding(cd.getDate(), 2) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getFullYear(), 4);
  }

  function zeroPadding(num, digit) {
      let zero = '';
      for (let i = 0; i < digit; i++) {
          zero += '0';
      }
      return (zero + num).slice(-digit);
  }