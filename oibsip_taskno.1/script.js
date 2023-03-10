let number = "";
let btns = document.querySelectorAll('.btn');
Array.from(btns).forEach((btn)=>{
  btn.addEventListener('click', (e)=>{
    if(e.target.innerHTML == 'Clear'){
      number = ""
      document.querySelector('input').value = number;
    }
    else if(e.target.innerHTML == '='){
      number = eval(number);
      document.querySelector('input').value = number;
    }
    else{ 
    console.log(e.target)
    number = number + e.target.innerHTML;
    document.querySelector('input').value = number;
      }
  })
})