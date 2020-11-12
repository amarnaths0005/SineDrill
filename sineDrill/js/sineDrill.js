(function() {

    /* HTML5 - JavaScript SineDrill Code, Ver Apr 2019, Oct 2020
    Written by Amarnath S
    amarnaths.codeproject@gmail.com    */

    let noviceAmplitudes = [1, 2, 5];
    let noviceFrequencies = [500, 1000, 2000]; // Multiplied by 2 pi
    let novicePhases = [-Math.PI/2, 0, Math.PI/2];

    let professionalAmplitudes = [1, 5, 10, 25, 50, 100];
    let professionalFrequencies = [60, 100, 250, 500, 1000, 2000]; // Multiplied by 2 pi
    let professionalPhases = [];
    let noProfessionalPhases = 61;
    let startProfessionalPhase = -30;
    let timeStartPoints = [-2, -1, 0]; // Will get divided by frequency
    let timeEndPoints = [1, 2]; // Will get divided by frequency
    let correctAmplitude;
    let correctFrequency;
    let correctPhase;
    let startTime;
    let endTime;
    let canvas;
    let ctx;
    let defaultGuessAmplitude = 1;
    let defaultGuessFrequency = 100;
    let defaultGuessPhase = 0.25;
    let guessAmplitude;
    let guessFrequency;
    let guessPhase;

    let xVals = [];
    let correctSinusoid = [];
    let guessSinusoid = [];
    let noXvals;
    let yMax, yMin, yDiff;

    let epsilon = 0.015;
    let showYLines;

    /*
    Functionality:
    1. Select a Computer Question (set of Amplitude, Frequency and Phase Shift), 
        and display the Computer Sinusoid graph in red.
    2. Show default guess values of the user - for amplitude, frequency and phase shoft. Draw the 
        blue Sinusoid curve (user's guess), on the same graph.
    3. Enable the user to enter three numerical values - amplitude, frequency and phase. Modify the blue
        Sinusoid curve accordingly. Modify the blue curve as and when the user modifies any of 
        the numerical values.
    4. Show the answer when the user clicks on Show Answer button.
    5. Allow the user to select User Level - Novice or Professional.
    6. Allow the user to start a New Quiz.
    7. Display Appreciation Message to the user when his/her guesses are close to the Computer Guess.
    */
    
    window.onload = init;

    function init() {
        // Fill up the Professional Level Phases array
        for( let i = 0; i < noProfessionalPhases; ++i) {
            let phase = (startProfessionalPhase + i) * 2 * Math.PI / (noProfessionalPhases - 1);
            professionalPhases.push(phase);
        }
        //console.log(professionalPhases);

        avalue.addEventListener('keyup', handleGuess, false);
        f_0value.addEventListener('keyup', handleGuess, false);
        phivalue.addEventListener('keyup', handleGuess, false);        

        let buttonAns = document.getElementById("bnAns");
        buttonAns.addEventListener('click', showAnswer, false);

        let buttonNew = document.getElementById("bnNewQuiz");
        buttonNew.addEventListener('click', setupNewQuiz, false);

        noXvals = 500;

        defaultGuessAmplitude = 1;
        defaultGuessFrequency = 100;
        defaultGuessPhase = 0.25;

        showYLines = false;

        canvas = document.getElementById('canvasSine'); 
        ctx = canvas.getContext('2d');
        setupNewQuiz();
    }

    function showAnswer() {
        let phase1 = correctPhase / Math.PI;
        let msgAns = "Answer is:  Amplitude = " + correctAmplitude.toFixed(3) + "; Frequency = " + correctFrequency.toFixed(1) + 
        "; Phase = " + phase1.toFixed(3) + " * \u03C0";
        alert(msgAns);
    }

    function setupNewQuiz(){
        correctAmplitude = noviceAmplitudes[Math.floor(Math.random() * noviceAmplitudes.length)];
        correctFrequency = noviceFrequencies[Math.floor(Math.random() * noviceFrequencies.length)];
        correctPhase = novicePhases[Math.floor(Math.random() * novicePhases.length)];

        if(document.getElementById('userPro').checked) {
            correctAmplitude = professionalAmplitudes[Math.floor(Math.random() * professionalAmplitudes.length)];
            correctFrequency = professionalFrequencies[Math.floor(Math.random() * professionalFrequencies.length)];
            correctPhase = professionalPhases[Math.floor(Math.random() * professionalPhases.length)];
        }

        startTime = timeStartPoints[Math.floor(Math.random() * timeStartPoints.length)];
        endTime = timeEndPoints[Math.floor(Math.random() * timeEndPoints.length)];

        guessAmplitude = defaultGuessAmplitude;
        guessFrequency = defaultGuessFrequency;
        guessPhase = defaultGuessPhase;

        document.getElementById('avalue').value = guessAmplitude.toFixed(3);
        document.getElementById('f_0value').value = guessFrequency.toFixed(1);
        document.getElementById('phivalue').value = guessPhase.toFixed(3);

        startTime /= correctFrequency;
        endTime /= correctFrequency;

        document.getElementById("msgCongrats").textContent = " ";

        readInputs();
        handleYScale();
        writeGuessEquation();
        drawSineGraphBox(ctx);
    }

    function checkDifferences() {
        let diff1 = Math.abs(correctAmplitude - guessAmplitude);
        let diff2 = Math.abs(correctFrequency - guessFrequency);
        let diff3 = Math.abs(correctPhase - guessPhase * Math.PI);

        // Handle aliasing in phase
        // Check whether diff3 is a multiple of 2 * PI.
        // For example, if 0.5 * PI is the correct phase, then all phases 
        //   0.5 * PI +/- (2 * PI) are also correct phases. This is why aliasing occurs.
        let factor1 = diff3 / (2.0 * Math.PI);
        let factor2 = Math.floor(factor1 + 0.5);
        let diff4 = Math.abs(factor1 - factor2);

        if( (diff1 < epsilon) && (diff2 < epsilon) && (diff4 < epsilon))
        {
            let msg = "Congrats! Your guess is correct! Play again - click on \"New Quiz\"";
            document.getElementById("msgCongrats").textContent = msg;
        }
        else {
            document.getElementById("msgCongrats").textContent = " ";
        }
    }

    function handleYScale() {
        if(guessAmplitude <= correctAmplitude) {
            yMax = correctAmplitude;
            yMin = -correctAmplitude;
            showYLines = false;
        }
        else {
            yMax = guessAmplitude;
            yMin = -guessAmplitude;
            showYLines = true;
        }

        yDiff = yMax - yMin;
    }

    function handleGuess() {
        readInputs();

        if(guessAmplitude < 0) {
            guessAmplitude = -guessAmplitude;
            document.getElementById('avalue').value = guessAmplitude.toFixed(3);
        }

        if(guessFrequency < 0){
            guessFrequency = -guessFrequency;
            document.getElementById('f_0value').value = guessFrequency.toFixed(1);
        }

        handleYScale();
        writeGuessEquation();
        drawSineGraphBox(ctx);
        checkDifferences();        
    }

    function readInputs(){
        let guessAmp = document.getElementById('avalue').value;
        guessAmplitude = parseFloat(guessAmp);

        let guessFreq = document.getElementById('f_0value').value;
        guessFrequency = parseFloat(guessFreq);

        let guessPha = document.getElementById('phivalue').value;
        guessPhase = parseFloat(guessPha);
    }

    function writeGuessEquation() {
        let ampStr = guessAmplitude.toFixed(3);
        let freStr = guessFrequency.toFixed(1);
        let phaStr = guessPhase.toFixed(3);

        let tmsg = "t + ";
        if(phaStr < 0) {
            tmsg = "t - ";
            phaStr = -phaStr;
        }

        let message = "Your Equation is:  y = " + ampStr + " cos( 2 \u03C0 " + freStr + tmsg + phaStr + " \u03C0)";
        document.getElementById('eqnGuess').textContent = message;        
    }

    function drawSineGraphBox(context){
        context.save();

        let cWidth = canvas.width;
        let cHeight = canvas.height;

        // First clear the canvas
        context.beginPath();
        context.fillStyle = "#FFDAB9";
        context.fillRect(0, 0, cWidth, cHeight);
        context.stroke();

        // Define the margins
        let xMarginLeft = 65;
        let xMarginRight = 30;
        let yMarginTop = 30;
        let yMarginBottom = 60;
        let xTextMargin = 59;
        let yTextMargin = yMarginTop + 7;

        // Draw Bounding box
        context.beginPath();
        context.fillStyle = "#fffacd";
        context.fillRect(xMarginLeft, yMarginTop, cWidth - xMarginLeft - xMarginRight, 
            cHeight - yMarginTop - yMarginBottom);
        context.strokeStyle = "#393939";

        context.moveTo(xMarginLeft, yMarginTop); // Point 1
        context.lineTo(cWidth - xMarginRight, yMarginTop); // Point 2
        context.lineTo(cWidth - xMarginRight, cHeight - yMarginBottom); // Point 3
        context.lineTo(xMarginLeft, cHeight - yMarginBottom); // Point 4
        context.lineTo(xMarginLeft, yMarginTop); // Point 1
        context.stroke();

        // Draw Y labels
        context.beginPath();
        context.font = "15pt Arial";
        context.fillStyle = "#a52a2a";
        context.textAlign = "right";
        let text = yMax.toFixed(1);
        context.fillText(text, xTextMargin, yTextMargin);
        let ampMinus = - yMax;
        text = ampMinus.toFixed(1);
        context.fillText(text, xTextMargin, cHeight - yMarginBottom + 3);
        let ampZero = 0;
        text = ampZero.toFixed(1);
        yTextMargin = (yMarginTop + cHeight - yMarginBottom) * 0.5;
        context.fillText(text, xTextMargin, yTextMargin);
        context.stroke();

        // Draw horizontal line at middle of graph
        context.beginPath();
        context.lineWidth = 1;
        context.moveTo(xMarginLeft,( yMarginTop + cHeight - yMarginBottom) / 2);
        context.lineTo(cWidth - xMarginRight, (yMarginTop + cHeight - yMarginBottom)/ 2);
        context.stroke();

        // Draw X labels
        // First find out the X-values
        let posStartTime = startTime;
        if(startTime < 0) {
            posStartTime = - startTime;
        }
        let diff = endTime - startTime;
        let x1 = - Math.floor(Math.log10(posStartTime) + 1);
        let x2 = - Math.floor(Math.log10(endTime) + 1);

        let noZerosMinVal;
        let startTimeXaxis;
        let stepXaxis;

        // The following programming gymnastics is to show nice x-coordinate values to the user.
        // Showing nice rounded values rather than confusing fractional values.
        if(startTime !== 0) {
            noZerosMinVal = -Math.floor(Math.log10(-startTime) + 1);
            let val1 = Math.pow(10, noZerosMinVal) * (-startTime);
            let val2 = 10 * val1;
            let firstDig = Math.floor(val2);
            startTimeXaxis = firstDig / Math.pow(10, noZerosMinVal + 1) * Math.sign(startTime);
            stepXaxis = Math.abs(startTimeXaxis / firstDig);
            let noXaxes = Math.floor(((endTime-startTime) / stepXaxis));
            if (noXaxes > 8) stepXaxis *= 2;
            if (noXaxes < 4) stepXaxis /= 2;
        }
        else {
            startTimeXaxis = 0;
            noZerosMinVal = - Math.floor(Math.log10(endTime) + 1);
            let val1 = Math.pow(10, noZerosMinVal) * endTime;
            let val2 = 10 * val1;
            let firstDig = Math.floor(val2);
            let endTimeXaxis = firstDig / Math.pow(10, noZerosMinVal + 1);
            stepXaxis = Math.abs(endTimeXaxis / firstDig);
            let noXaxes = Math.floor(((endTime-startTime) / stepXaxis));
            if (noXaxes > 8) stepXaxis *= 2;
            if (noXaxes < 4) stepXaxis /= 2;
        }

        if((startTimeXaxis - startTime) > stepXaxis) {
            startTimeXaxis -= stepXaxis;
        }

        let xTimeAxis = startTimeXaxis;
        let xAxisDiff = cWidth - xMarginRight - xMarginLeft;
        let diff1;
        let xPos;

        // Draw the vertical lines and the x-values
        while (xTimeAxis <= endTime) {
            diff1 = xTimeAxis - startTime;
            xPos = diff1 * xAxisDiff / diff + xMarginLeft;
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(xPos, yMarginTop); 
            context.lineTo(xPos, cHeight - yMarginBottom);
            text = xTimeAxis.toFixed(4);
            yTextMargin = (cHeight - 0.5 * yMarginBottom);
            context.textAlign = "center";
            context.fillText(text, xPos, yTextMargin);
            context.stroke();
            xTimeAxis += stepXaxis;
        }

        context.beginPath();
        text = "time t (seconds)";
        xPos = cWidth - 75;
        context.textAlign = "right";
        context.fillText(text, xPos, cHeight - 10);
        text = "y";
        let xPos1 = xMarginLeft / 2;
        let yPos1 = 3 * (yMarginTop + (cHeight - yMarginBottom)) / 8;
        context.fillText(text, xPos1, yPos1);
        context.stroke();

        // Horizontal arrow line
        drawArrow(context, xPos + 10, cHeight - 15, xPos + 56, cHeight - 15);
        // Vertical arrow line
        drawArrow(context, xPos1 - 5, yPos1 - 20, xPos1 - 5, yPos1 - 60);

        drawCorrectSinusoid(context, cWidth, cHeight, xMarginLeft, xMarginRight, yMarginTop, yMarginBottom);
        drawGuessSinusoid(context, cWidth, cHeight, xMarginLeft, xMarginRight, yMarginTop, yMarginBottom);
        context.restore();
    }

    // From SO site, to draw an arrow head
    function drawArrow(context, fromx, fromy, tox, toy){
        context.save();
        context.beginPath();
        var headlen = 12;   // length of head in pixels
        var angle = Math.atan2(toy-fromy, tox-fromx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI/6), toy-headlen * Math.sin(angle-Math.PI/6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI/6), toy-headlen * Math.sin(angle+Math.PI/6));
        context.stroke();
        context.restore();
    }

    function drawCorrectSinusoid(context, cWidth, cHeight, xMarginLeft, xMarginRight, yMarginTop, yMarginBottom){
        context.save();

        let step = (endTime - startTime) / noXvals;
        xVals.length = 0;
        correctSinusoid.length = 0;
        let xVal, sinu;

        for(let i = 0; i <= noXvals; ++i)
        {
            xVal = startTime + step * i; // indicates time
            xVals.push(xVal);
            sinu = correctAmplitude * Math.cos(2 * Math.PI * xVals[i] * correctFrequency + correctPhase);
            correctSinusoid.push(sinu);
        }

        let xStep = (cWidth - xMarginLeft - xMarginRight)/noXvals;
        let yLim1 = cHeight - yMarginBottom;
        let yLim2 = yMarginTop;
        let yLimDiff = yLim2 - yLim1;
        let yFactor = yLimDiff / yDiff;
        let xPoint0, yPoint0, xPoint1, yPoint1;

        // Draw the curve for the Correct Sinusoid in red colour
        context.strokeStyle = "#ff0000";
        context.beginPath();
        xPoint0 = xMarginLeft;
        yPoint0 = (correctSinusoid[0] - yMin) * yFactor + yLim1;
        context.moveTo(xPoint0, yPoint0);

        for( var i = 1; i <= xVals.length; ++i) {
            xPoint1 = xMarginLeft + i * xStep;
            yPoint1 = (correctSinusoid[i] - yMin) * yFactor + yLim1; 
            context.lineTo(xPoint1, yPoint1);
        }
        context.lineWidth = 3;
        let period = 1000.0 / correctFrequency; // milliseconds
        let periodText = "Period = " + period.toFixed(3) + " ms"
        context.textAlign = "right";
        let xPos1 = cWidth - 10;
        let yPos1 = 20;
        context.fillText(periodText, xPos1, yPos1);
        context.stroke();

        context.beginPath();
        // If the user guess is more than the correct guess, for amplitude, draw two amplitude horizontal lines
        if(showYLines){
            xPoint0 = xMarginLeft;
            xPoint1 = cWidth - xMarginRight;
            yPoint0 = (correctAmplitude - yMin) * yFactor + yLim1;
            context.strokeStyle = "#393939";
            context.lineWidth = 1;
            context.moveTo(xPoint0, yPoint0);
            context.lineTo(xPoint1, yPoint0);
            yPoint1 = (-correctAmplitude - yMin) * yFactor + yLim1;
            context.moveTo(xPoint0, yPoint1);
            context.lineTo(xPoint1, yPoint1);

            context.font = "15pt Arial";
            context.fillStyle = "#a52a2a";
            context.textAlign = "right";
            let xTextMargin = 59;
            let text = correctAmplitude.toFixed(1);
            context.fillText(text, xTextMargin, yPoint0);
            let ampMinus = - correctAmplitude;
            text = ampMinus.toFixed(1);
            context.fillText(text, xTextMargin, yPoint1);
        }
        context.stroke();
        context.restore();
    }

    function drawGuessSinusoid(context, cWidth, cHeight, xMarginLeft, xMarginRight, yMarginTop, yMarginBottom){
        context.save();
        guessSinusoid.length = 0;
        let sinu;
        let step = (endTime - startTime) / noXvals;

        // guessPhase is typically a number between -1 and 1, and it is to be multiplied by PI
        for(let i = 0; i <= noXvals; ++i)
        {
            xVal = startTime + step * i; // indicates time
            sinu = guessAmplitude * Math.cos(2 * Math.PI * xVal * guessFrequency + guessPhase * Math.PI);
            guessSinusoid.push(sinu);
        }

        let xStep = (cWidth - xMarginLeft - xMarginRight)/noXvals;
        let yLim1 = cHeight - yMarginBottom;
        let yLim2 = yMarginTop;
        let yLimDiff = yLim2 - yLim1;
        let yFactor = yLimDiff / yDiff;
        let xPoint0, yPoint0, xPoint1, yPoint1;

        // Draw the curve for the Guess Sinusoid in blue colour
        context.strokeStyle = "#0000ff";
        context.beginPath();
        xPoint0 = xMarginLeft;
        yPoint0 = (guessSinusoid[0] - yMin) * yFactor + yLim1;

        if(yPoint0 < yMarginTop) {
            yPoint0 = yMarginTop;
        }

        if( yPoint0 > (cHeight - yMarginBottom)) {
            yPoint0 = cHeight - yMarginBottom;
        }

        context.moveTo(xPoint0, yPoint0);

        for( var i = 1; i <= xVals.length; ++i) {
            xPoint1 = xMarginLeft + i * xStep;
            yPoint1 = (guessSinusoid[i] - yMin) * yFactor + yLim1; 

            if(yPoint1 < yMarginTop) {
                yPoint1 = yMarginTop;
            }

            if( yPoint1 > (cHeight - yMarginBottom)) {
                yPoint1 = cHeight - yMarginBottom;
            }
            context.lineTo(xPoint1, yPoint1);
        }
        context.lineWidth = 3;
        context.stroke();
        
        // Draw box around graph
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = "#393939";
        context.moveTo(xMarginLeft, yMarginTop);
        context.lineTo(cWidth - xMarginRight, yMarginTop);
        context.lineTo(cWidth - xMarginRight, cHeight - yMarginBottom);
        context.lineTo(xMarginLeft, cHeight - yMarginBottom);;
        context.lineTo(xMarginLeft, yMarginTop);
        context.stroke();
        context.restore();        
    }
}());
