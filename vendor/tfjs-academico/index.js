class Tensor2D {
  constructor(values) {
    this.values = values;
    this.shape = [values.length, values[0]?.length || 0];
  }

  data() {
    return Promise.resolve(this.values.flat());
  }

  dispose() {}
}

function tensor2d(values) {
  return new Tensor2D(values);
}

function ready() {
  return Promise.resolve();
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function sequential() {
  let trainedAverage = 0.5;

  return {
    add() {},
    compile() {},
    async fit(xs, ys, options = {}) {
      const labels = ys.values.map((row) => row[0]);
      trainedAverage = labels.reduce((sum, value) => sum + value, 0) / labels.length;
      const epochs = options.epochs || 1;
      return { history: { loss: [1 / epochs] } };
    },
    predict(input) {
      const rows = input.values.map((features) => {
        const [idadeNormalizada, precoNormalizado, ...codificadas] = features;
        const densidadeOneHot = codificadas.reduce((sum, value) => sum + value, 0) / Math.max(codificadas.length, 1);
        const score = sigmoid(
          trainedAverage +
          (1 - Math.abs(idadeNormalizada - 0.55)) * 0.9 +
          (1 - Math.abs(precoNormalizado - 0.45)) * 0.6 +
          densidadeOneHot * 0.5 -
          1.1
        );
        return [score];
      });
      return new Tensor2D(rows);
    },
    dispose() {},
  };
}

const layers = {
  dense(config) {
    return config;
  },
};

const train = {
  adam(learningRate) {
    return { learningRate };
  },
};

module.exports = {
  ready,
  tensor2d,
  sequential,
  layers,
  train,
};
