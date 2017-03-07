/***
*		Mujahid Maqsood
*		ID: 100939220
*
*		Front end javascript
*		
*		Handles loading and rendering data from the server
*/

// Our API root that we talk to
var API_ROOT = 'http://localhost:2406';
var userId = '';
var guesses = 0;
$(document).ready(function() {
    userId = promptUser();
   	saveUser(userId, function(){
   		setupGame();
   	});
});

var setupGame = function() {
	guesses = 0;
	generateBoard();
	$('.card').on('click', onCardClick);
}
var onCardClick = function(e) {
	var isDisabled = $('#card-grid').data('disabled') === true;
	if (!isDisabled) {
		var $card = $(e.currentTarget);
		var rowIdx = $card.data('rowIdx');
		var colIdx = $card.data('colIdx');
		getCardText(rowIdx, colIdx, function(cardValue){
			$card.html(cardValue);
			activateCard($card);
		});
	}
}
var activateCard = function($card) {
	var $currentActiveCard = $('.active:not(.matched)');
	$card.addClass('active');
	
	if (!($card.is($currentActiveCard)) && $currentActiveCard.length > 0) {
		guesses++;
		var activeCardVal = $currentActiveCard.html();
		var currentCardVal = $card.html();
		if (activeCardVal === currentCardVal) {
			$currentActiveCard.addClass('matched');
			$card.addClass('matched');
			// Check win
			var nonMatchedCards = $('#card-grid .card:not(.matched)');
			if (nonMatchedCards.length === 0) {
				setTimeout(function(){
					alert('You won with ' + guesses + ' guesses');
					setupGame();
				}, 100);
			}
		}
		else {
			$('#card-grid').data('disabled', true);
			setTimeout(function(){
				$('#card-grid').data('disabled', false);
				$currentActiveCard.removeClass('active')
				$card.removeClass('active');
				$currentActiveCard.html('')
				$card.html('');
			}, 1000);
		}
	}
}
var getCardText = function(rowIdx, colIdx, done) {
	$.get(API_ROOT + '/memory/card', { 
		id: userId,
		rowIdx: rowIdx,
		cardIdx: colIdx
	}, done);
}

var generateBoard = function() {
	var $table = $('#card-grid');
	$table.empty();
	for (var idx = 0; idx < 4; idx++) {
		var $row = $('<tr></tr>');
		appendCardDiv($row, idx);
		$table.append($row);
	}
}
var appendCardDiv = function($row, rowIdx) {
	var $cardDiv = getCardDiv();
	$row.append(getCardDiv(rowIdx, 0));
	$row.append(getCardDiv(rowIdx, 1));
	$row.append(getCardDiv(rowIdx, 2));
	$row.append(getCardDiv(rowIdx, 3));
}
var getCardDiv = function(rowIdx, colIdx) {
	var $td = $('<td></td>');
	var $cardDiv = $('<div class="card"></div>');
	$cardDiv.data('row-idx', rowIdx);
	$cardDiv.data('col-idx', colIdx);
	$td.append($cardDiv);
	return $td;
}
var saveUser = function(id, done) {
	$.post(API_ROOT + '/memory/intro', { id: id }, function() {
	  done();
	});
}

var promptUser = function() {
	return prompt('Please enter your name') || 'Player';
}