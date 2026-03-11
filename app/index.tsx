import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, StatusBar, Modal } from 'react-native';

const { width } = Dimensions.get('window');

export default function TicTacToe() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  // Estados para el Modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWinner = (squares: (string | null)[]) => {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Empate';
  };

  const minimax = (tempBoard: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(tempBoard);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'Empate') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = 'O';
          let score = minimax(tempBoard, depth + 1, false);
          tempBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = 'X';
          let score = minimax(tempBoard, depth + 1, true);
          tempBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (currentBoard: (string | null)[]) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  useEffect(() => {
    if (!isPlayerTurn) {
      const winner = checkWinner(board);
      if (winner) return;

      const timer = setTimeout(() => {
        const move = Math.random() < 0.6 
          ? getBestMove([...board]) 
          : board.map((s, i) => s === null ? i : null).filter((i): i is number => i !== null)[0];

        if (move !== undefined && move !== -1) handleMove(move, 'O');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn]);

  const handleMove = (index: number, symbol: string) => {
    if (board[index] || checkWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = symbol;
    setBoard(newBoard);
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setTimeout(() => {
        if (winner === 'Empate') setModalTitle("¡Fue un empate!");
        else if (winner === 'X') setModalTitle("¡Usuario ha ganado!");
        else setModalTitle("¡El dispositivo ha ganado!");
        setModalVisible(true);
      }, 300);
    } else {
      setIsPlayerTurn(symbol === 'O');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* MODAL PERSONALIZADO (ALERT OSCURO NEON) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={resetGame}>
              <Text style={styles.modalBtnText}>REINTENTAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.neonTitle}>Tic-Tac-Toe</Text>
      
      <View style={styles.boardContainer}>
        <View style={styles.board}>
            {board.map((cell, i) => (
            <TouchableOpacity 
                key={i}
                style={styles.square} 
                onPress={() => isPlayerTurn && handleMove(i, 'X')}
            >
                <Text style={cell === 'X' ? styles.xText : styles.oText}>
                    {cell}
                </Text>
            </TouchableOpacity>
            ))}
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
        <Text style={styles.resetText}>REINICIAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonTitle: {
    fontSize: 50,
    color: '#f0f',
    fontWeight: 'bold',
    marginBottom: 50,
    textShadowColor: '#f0f',
    textShadowRadius: 15,
  },
  boardContainer: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#0ff',
    borderRadius: 10,
    backgroundColor: '#050505',
    shadowColor: '#0ff',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  board: {
    width: width * 0.8,
    height: width * 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  xText: {
    fontSize: 60,
    color: '#0ff',
    textShadowColor: '#0ff',
    textShadowRadius: 15,
  },
  oText: {
    fontSize: 60,
    color: '#f0f',
    textShadowColor: '#f0f',
    textShadowRadius: 15,
  },
  resetBtn: {
    marginTop: 60,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: '#39ff14',
    borderRadius: 5,
  },
  resetText: {
    color: '#39ff14',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  // ESTILOS DEL MODAL OSCURO
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.75,
    padding: 30,
    backgroundColor: '#050505',
    borderWidth: 2,
    borderColor: '#f0f',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#f0f',
    shadowRadius: 20,
    elevation: 25,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: '#f0f',
    textShadowRadius: 5,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#0ff',
    borderRadius: 5,
  },
  modalBtnText: {
    color: '#0ff',
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});