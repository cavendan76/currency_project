const urlApi = "https://mindicador.cl/api/";

const amountInput = document.getElementById("monto");
const btn = document.getElementById("boton");
const result = document.getElementById("resultado");
const selector = document.getElementById("seleccion");

async function getApi() {
  try {
    const res = await fetch(urlApi);
    const data = await res.json();

    return data;
  } catch (e) {
    alert("Problemas al Obtener los Datos");
  }
}

async function fillCurrency() {
  try {
    const data = await getApi();

    let fields = Object.keys(data);
    let html = "<option selected>Moneda a Convertir</option>";
    let cont = 1;

    fields.forEach((currencyType) => {
      let currency = data[currencyType];

      if (currency.nombre) {
        html += `                 
      <option value="${cont}-${currency.valor}" label="${currency.nombre}">${currency.codigo}</option>
    `;
        cont = cont + 1;
      }
    });

    selector.innerHTML = html;
  } catch (e) {
    alert(e.message);
  }
}

// Funcion que da formato CLP
const clpFormat = (number) => {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = "$1,";
  let arr = number.toString().split(".");

  arr[0] = arr[0].replace(exp, rep);

  return arr[1] ? arr.join(".") : arr[0];
};

async function convertorResult() {
  const clp = amountInput.value;
  const cur = selector.value.split("-");

  if (clp == "" || cur == "Moneda a Convertir" || clp <= 0) {
    alert(`Debe ingresar el valor en pesos y/o la moneda a convertir...`);
  } else {
    let total = Number(clp) / Number(cur[1]);
    result.textContent = `Resultado: $ ${clpFormat(total.toFixed(2))}`;
    renderGrafica();
  }
}

async function getAndCreateDataToChart() {
  const cur = selector.value.split("-");
  const curCode = selector.options[cur[0]].textContent;
  const res = await fetch(urlApi + curCode);
  const amounts = await res.json();
  const curAmts = amounts.serie;
  const cur10Amts = curAmts.slice(0, 10);
  const cur10AmtsRev = [...cur10Amts].reverse();

  const labels = cur10AmtsRev.map((curAmt) => {
    return curAmt.fecha.substring(0, 10);
  });
  const data = cur10AmtsRev.map((curAmt) => {
    return curAmt.valor;
  });
  const datasets = [
    {
      label: "Últimos 10 Días [" + curCode + "]",
      borderColor: "rgb(255, 99, 132)",
      data,
    },
  ];
  return { labels, datasets };
}

let graphic;
async function renderGrafica() {
  const data = await getAndCreateDataToChart();
  const config = {
    type: "line",
    data,
  };
  const myChart = document.getElementById("myChart");
  myChart.style.backgroundColor = "white";

  if (graphic) {
    graphic.destroy();
  }
  graphic = new Chart(myChart, config);
}

window.onload = fillCurrency();
btn.addEventListener("click", () => convertorResult());
